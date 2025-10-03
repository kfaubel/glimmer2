import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// This is like node's builtin Buffer but works in the browser
//import dotenv from 'dotenv';

//import Buffer from "buffer/";
const Buffer = require('buffer/').Buffer

export interface ScreenItem {
    enabled?: boolean;
    month?: string;           // blank or "1:5" for Jan - May
    friendlyName: string;
    nextUpdate?: number;
    resource: string;
    displaySecs: number;
    refreshMinutes: number;
    image?: any | null;
    imageUri: string;
    message: string;
    timeBug: string;
}

export class Sequence {
    nextIndex: number;
    screenList: Array<ScreenItem>;
    updatePeriod: number;
    nullCount: number;
    profile: string;
    screenListUrlBase: string | undefined;
    screenListRefreshInterval: NodeJS.Timeout | null;
    
    constructor(profile: string) {
        this.nextIndex = 0;
        this.screenList = [];
        this.updatePeriod = 60;
        this.nullCount = 0;
        this.profile = profile;
        this.screenListRefreshInterval = null;

        //dotenv.config();
        this.screenListUrlBase = process.env.REACT_APP_SCREEN_LIST_URL_BASE;
        console.log(`Sequence::constructor - SCREEN_LIST_URL_BASE: ${this.screenListUrlBase}`)
    }

    start = async () => {
        await this.getScreenList();

        // Fetch the screenlist every 6 hours, purge screens and retrieve new items
        this.screenListRefreshInterval = setInterval(() => {
            console.log(`Sequence::start - Refreshing screen list every 6 hours...`);
            this.refreshScreenList();
        }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds

        await this.update(); // Do it once now.
        setInterval(this.update, 60*1000);
    }

    getScreenList = async () => {
        this.screenList = []; // Replace the current list

        let activeScreens = 0;
        let message = "";
        try {            
            if (this.profile === "") {
                console.log(`Sequence::getScreenList - No porfile`);
                message = `http://host:port/<profile> - no profile`;
                throw new Error("No profile");
            }
           
            if (this.screenListUrlBase === undefined) {
                console.log(`Sequence::getScreenList - No screenListUrlBase in environment`);
                message = `http://host:port/<profile> - No SCREEN_LIST_URL_BASE`;
                throw new Error("No profile");
            }

            const url = this.screenListUrlBase + this.profile + ".json";
            console.log(`Sequence::getScreenList - Retreiving: ${url}`)

            const options: AxiosRequestConfig = {
                timeout: 20000
            };

            let serverList: Array<ScreenItem> = [];

            await axios.get(url, options)
                .then((res: AxiosResponse) => {
                    console.log(`Sequence::getScreenList GET ${url} result ${res.status}`);
                    if (typeof res.data.screens !== "undefined") {
                        serverList = res.data.screens as Array<ScreenItem>;
                        //console.log(JSON.stringify(serverList, null, 4));
                    }
                })
                .catch((err) => {
                    //console.log(JSON.stringify(err, null, 4));
                    if (axios.isAxiosError(err)) {
                        if (err.response) {
                            console.log(`Sequence::getScreenList GET result ${err.response.status}`);
                            message = `Profile '${this.profile}' not found (${err.response.status})`;
                        } else {
                            console.log(`Sequence::getScreenList GET result NULL`);
                            message = `Profile '${this.profile}' unknown error`;
                        }
                    }

                    //throw new Error("Error on GET");
                });

            let parseErrors = "";
            if (serverList !== null) {
                serverList.forEach((screen, index) => {
                    screen.image = null;
                    screen.nextUpdate = 0;
                    screen.imageUri = "";
                    screen.message = "";

                    // Enabled and friendlyName must both be specified or its an error, even if enabled is false
                    if (typeof screen.enabled !== "boolean") {
                        parseErrors += `Item: ${index} - invalid enabled element, skipping\n`;
                        return; // This is a continue in a forEach()
                    }
                    
                    // Check the friendlyName
                    if (typeof screen.friendlyName !== "string" || screen.friendlyName.length > 50) {
                        parseErrors += `Item: ${index} - invalid friendlyName, skipping\n`;
                        return;
                    }
                    
                    // Now check to see if we should skip this one
                    if (!screen.enabled) {
                        console.log(`Sequence: Skipping: ${screen.friendlyName}`);
                        return; // Skip this one
                    }
                    
                    // Check the resource
                    // We are not going to check to see if this is valid URL
                    if (typeof screen.resource !== "string" || screen.resource.length < 10 || screen.resource.length > 200) {
                        parseErrors += `Item: ${index} (${screen.friendlyName})- invalid resource, length must be 10-200, skipping\n`;
                        return;
                    }

                    // Check the month
                    if (typeof screen.month === "undefined") {
                        // all good, this is optional
                    } else if (typeof screen.month !== "string") {
                        parseErrors += `Item: ${index} (${screen.friendlyName}) - month not a string, skipping\n`;
                        return;
                    }

                    // Check the refreshMinutes
                    if (typeof screen.refreshMinutes !== "string") {
                        parseErrors += `Item: ${index} (${screen.friendlyName}) - refreshMinutes is not a string, skipping\n`;
                        return;
                    }

                    const refreshMinutes = parseInt(screen.refreshMinutes);
                    if (isNaN(refreshMinutes)) {
                        parseErrors += `Item: ${index} (${screen.friendlyName}) - refreshMinutes is not a valid number, skipping\n`;
                        return;
                    }

                    if (refreshMinutes < 5 || refreshMinutes > 24 * 60) {
                        parseErrors += `Item: ${index} (${screen.friendlyName}) - refreshMinutes is less than 5 or greater than 1440, skipping\n`;
                        return;
                    }

                    // Check the displaySecs
                    if (typeof screen.displaySecs !== "string") {
                        parseErrors += `Item: ${index} (${screen.friendlyName}} - displaySecs is not a string, skipping\n`;
                        return;
                    }

                    const displaySecs = parseInt(screen.displaySecs);
                    if (isNaN(displaySecs)) {
                        parseErrors += `Item: ${index} (${screen.friendlyName}) - displaySecs is not a valid number, skipping\n`;
                        return;
                    }

                    if (displaySecs < 5 || displaySecs > 60) {
                        parseErrors += `Item: ${index} (${screen.friendlyName}) - displaySecs is less than 5 or greater than 60, skipping\n`;
                        return;
                    }

                    // Check the timeBug
                    if (typeof screen.timeBug === "undefined") {
                        // all good, this is optional
                        screen.timeBug = "";
                    } else if (typeof screen.timeBug !== "string") {
                        parseErrors += `Item: ${index} (${screen.friendlyName}) - timeBug not a string, skipping\n`;
                        return;
                    }

                    if (typeof screen.timeBug !== "string") {
                        parseErrors += `Item: ${index} (${screen.friendlyName}) - displaySecs is not a string, skipping\n`;
                        return;
                    }
                            
                    // "resource": "https://glimmerstorage.blob.core.windows.net/glimmer/googleTopTen-[01:10].jpg",
                    if (screen.resource.includes("[01:10]")) {                  
                        for (let i = 1; i <= 10; i++) {
                            const newScreen = JSON.parse(JSON.stringify(screen));  // Full clone of the screen 

                            let indexStr = `${i}`;
                            if (indexStr.length === 1) {
                                indexStr = "0" + indexStr;
                            }
                            const resource = screen.resource;
                            const newResource = resource.replace("[01:10]", indexStr);
                            newScreen.resource = newResource;
                            newScreen.friendlyName = screen.friendlyName + "-" + indexStr;

                            this.screenList.push(newScreen);
                            
                            activeScreens++;
                            console.log(`Sequence: Adding:   ${newScreen.friendlyName}  - ${newResource}`);
                        }
                    } else {
                        this.screenList.push(screen);
                        activeScreens++;
                        console.log(`Sequence: Adding:   ${screen.friendlyName}  - ${screen.resource}`);
                    }
                });
            }

            if (parseErrors.length > 0) {
                console.log(parseErrors);
            }

        } catch (e) {
            console.log(`Sequence::getScreenList failed to get data: ${e}`);
        }

        if (message === "" && activeScreens === 0) 
            message = "No active screens";

        if (this.screenList.length === 0) {
            this.screenList.push({
                enabled: true,
                friendlyName: "No list",
                resource: "", 
                refreshMinutes: 999999, 
                displaySecs: 60,
                nextUpdate: 0,
                image: null,
                imageUri: "",
                message: message,
                timeBug: ""
            });
        }
    }

    refreshScreenList = async () => {
        console.log(`Sequence::refreshScreenList - Starting screen list refresh...`);
        
        // Purge current screens by clearing their images and resetting state
        this.screenList.forEach(screen => {
            screen.image = null;
            screen.imageUri = "";
            screen.nextUpdate = 0;
            screen.message = "";
        });
        
        // Reset the index to start from the beginning
        this.nextIndex = 0;
        
        // Fetch the new screen list
        await this.getScreenList();
        
        // Update all screens immediately after getting the new list
        await this.update();
        
        console.log(`Sequence::refreshScreenList - Screen list refresh completed. New list has ${this.screenList.length} items.`);
    }

    // Method to stop the refresh interval (useful for cleanup)
    stopScreenListRefresh = () => {
        if (this.screenListRefreshInterval) {
            clearInterval(this.screenListRefreshInterval);
            this.screenListRefreshInterval = null;
            console.log(`Sequence::stopScreenListRefresh - Screen list refresh interval stopped.`);
        }
    }

    update = async () => {
        console.log(`Sequence::update - **********************  Starting  *********************`);
        const now = new Date().getTime();
        if (this.screenList === undefined || this.screenList === null) {
            console.log("ScreenList is empty.  Skipping update" + this.screenList);
            return;
        }
        
        this.screenList.forEach(async (screen) => {
            if (typeof screen.nextUpdate === "undefined") {
                console.log(`Sequence:: update screen.nextUpdate is undefined, Setting to now.`);
                screen.nextUpdate = now;
            }
            
            if (screen.nextUpdate <= now) {
                console.log(`Sequence::update: Time to update: ${screen.resource}`);

                const options: AxiosRequestConfig = {
                    responseType: "arraybuffer",
                    // The following header causes  a CORS error
                    // headers: {                        
                    //     "Content-Encoding": "gzip"
                    // },
                    timeout: 20000
                };

                let screenData: Buffer | null = null;
                
                await axios.get(screen.resource, options)
                    .then((res: AxiosResponse) => {
                        screenData = res?.data;
                    })
                    .catch((err) => {
                        //console.log(JSON.stringify(err, null, 4));
                        if (axios.isAxiosError(err)) {
                            if (err.response) {
                                console.warn(`Sequence::update GET result ${err.response.status} for ${screen.resource}`);
                                screen.message = `${screen.friendlyName}: HTTP ${err.response.status}`;
                            } else if (err.code === 'ERR_NETWORK' || err.message.includes('CORS')) {
                                console.warn(`Sequence::update CORS/Network error for ${screen.resource}`);
                                screen.message = `${screen.friendlyName}: CORS/Network error - server may not allow cross-origin requests`;
                            } else {
                                console.warn(`Sequence::update GET result NULL for ${screen.resource}`);
                                screen.message = `${screen.friendlyName}: Network error`;
                            }

                            // Failure.  Try again in 10 minutes
                            screen.nextUpdate = now + (10 * 60 * 1000);
                        }
                    });

                if (screenData !== null) {
                    const imageString = Buffer.from(screenData, 'binary').toString('base64');

                    let type;
                    if (imageString.charAt(0) === '/') {
                        type = "jpeg";
                    } else if (imageString.charAt(0) === 'i') {
                        type = "png";
                    } else if (imageString.charAt(0) === 'R') {
                        type = "gif";
                    } else if (imageString.charAt(0) === 'U') {
                        type = "webp";
                    } else {
                        type = "";
                    }

                    let image = new Image();
                    
                    // Try to set crossorigin attribute to handle CORS-enabled servers
                    image.crossOrigin = "anonymous";

                    image.onload = () => {
                        screen.image = image;
                    }

                    image.onerror = () => {
                        console.error(`Sequence::update: ${screen.resource} image.onerror`);
                        screen.image = null;
                        screen.message = `${screen.friendlyName}: Failed to load image data`
                    }

                    // The imgStr is actually a data URI that can be used to load an image directly
                    // as in: <img src={imgStr} />
                    const imgStr = "data:image/" + type + ";base64," + imageString;
                    image.src = imgStr; // This starts the load.  onload or onerror will be called later
                    screen.imageUri = imgStr;

                    screen.nextUpdate = now + (screen.refreshMinutes * 60 * 1000);
                } 
            } else {
                const secsTilUpdate = (screen.nextUpdate - now)/1000;
                const formattedName = (screen.friendlyName + "                           ").substring(0,25);
                console.log(`Sequence::update: ${formattedName} up-to-date, ${secsTilUpdate.toFixed(0)} secs to go`)
            }
        });
    }
   
    getFirst = (): ScreenItem => {
        const startImage:ScreenItem = {
            image: null, 
            imageUri: process.env.PUBLIC_URL + "/dawn.jpg",
            displaySecs: 10, 
            nextUpdate: 0, 
            refreshMinutes: 0, 
            resource: "", 
            friendlyName: "Starting (dawn)", 
            message: "Starting...",
            timeBug: "lower-right-light"}
        return startImage;
    }

    getNext = (): ScreenItem => {
        if (this.screenList.length === 0) {
            // Once the screenlist is loaded it will have at least one entry, even if its the "No list" time screen.
            // So, at this point, getScreenList has not finished.
            const startImage:ScreenItem = {
                image: null, 
                imageUri: "",
                displaySecs: 10, 
                nextUpdate: 0, 
                refreshMinutes: 0, 
                resource: "", 
                friendlyName: "Still starting", 
                message: "Still starting...",
                timeBug: ""
            };
            return startImage;
        }

        let item: ScreenItem = this.screenList[this.nextIndex];

        this.nextIndex++;
        
        if (this.nextIndex >= this.screenList.length) {
            this.nextIndex = 0;
        }

        // If the image is null, look for the next one that is non-null
        while (item.image === null) {
            const startingIndex = this.nextIndex;
        
            console.warn(`Skipping ${item.friendlyName} since the iamge is null`);
            item = this.screenList[this.nextIndex];

            this.nextIndex++;
        
            if (this.nextIndex >= this.screenList.length)
                this.nextIndex = 0;
            
            if (startingIndex === this.nextIndex) {
                // We went through the entire list and did not find a non-null image
                console.warn("All the screen items had null images, show the 'No images...' screen")
                item = {
                    image: null, 
                    imageUri: "",
                    displaySecs: 10, 
                    nextUpdate: 0, 
                    refreshMinutes: 0, 
                    resource: "", 
                    friendlyName: "No images", 
                    message: "No images...",
                    timeBug: "lower-right-light"
                };
                
                break;
            }
        }
        
        return item;
    }
}