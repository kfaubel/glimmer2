import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ScreenItem } from '../types';
import { APP_CONFIG, DEFAULT_SCREENS } from '../constants';
import {
  getImageTypeFromBase64,
  createDataUri,
  validateScreenItem,
  formatTimeRemaining,
  padScreenName,
} from './imageUtils';

const Buffer = require('buffer/').Buffer;

export class Sequence {
  private nextIndex: number = 0;
  private screenList: ScreenItem[] = [];
  private readonly updatePeriod: number = APP_CONFIG.UPDATE_INTERVAL_MS;
  private nullCount: number = 0;
  private readonly profile: string;
  private readonly screenListUrlBase: string | undefined;
  private updateInterval?: NodeJS.Timeout;
  private screenListInterval?: NodeJS.Timeout;

  constructor(profile: string) {
    this.profile = profile;
    this.screenListUrlBase = process.env.REACT_APP_SCREEN_LIST_URL_BASE;
    console.log(
      `Sequence::constructor - SCREEN_LIST_URL_BASE: ${this.screenListUrlBase}`
    );
  }

  public start = async (): Promise<void> => {
    try {
      await this.getScreenList();
      
      // Refresh screen list every 24 hours
      this.screenListInterval = setInterval(
        this.getScreenList, 
        APP_CONFIG.SCREEN_LIST_REFRESH_HOURS * 60 * 60 * 1000
      );

      // Initial update
      await this.update();
      
      // Set up regular updates
      this.updateInterval = setInterval(this.update, this.updatePeriod);
    } catch (error) {
      console.error('Failed to start sequence:', error);
    }
  };

  public stop = (): void => {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.screenListInterval) {
      clearInterval(this.screenListInterval);
    }
  };

  private getScreenList = async (): Promise<void> => {
    this.screenList = [];
    let activeScreens = 0;
    let message = '';

    try {
      if (!this.profile) {
        console.log('Sequence::getScreenList - No profile');
        message = 'http://host:port/<profile> - no profile';
        throw new Error('No profile');
      }

      if (!this.screenListUrlBase) {
        console.log('Sequence::getScreenList - No screenListUrlBase in environment');
        message = 'http://host:port/<profile> - No SCREEN_LIST_URL_BASE';
        throw new Error('No screenListUrlBase');
      }

      const url = `${this.screenListUrlBase}${this.profile}.json`;
      console.log(`Sequence::getScreenList - Retrieving: ${url}!`);

      const options: AxiosRequestConfig = {
        timeout: APP_CONFIG.REQUEST_TIMEOUT_MS,
      };

      let serverList: ScreenItem[] = [];

      const response = await axios.get(url, options);
      console.log(`Sequence::getScreenList GET ${url} result ${response.status}`);
      
      if (response.data?.screens) {
        serverList = response.data.screens as ScreenItem[];
      }

      const parseErrors = this.processServerList(serverList);
      activeScreens = this.screenList.length;

      if (parseErrors.length > 0) {
        console.log(parseErrors.join('\n'));
      }
    } catch (error) {
      console.log(`Sequence::getScreenList failed to get data:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log(`Sequence::getScreenList GET result ${error.response.status}`);
          message = `Profile '${this.profile}' not found (${error.response.status})`;
        } else {
          console.log('Sequence::getScreenList GET result NULL');
          message = `Profile '${this.profile}' unknown error`;
        }
      }
    }

    // Handle empty screen list
    if (message === '' && activeScreens === 0) {
      message = 'No active screens';
    }

    if (this.screenList.length === 0) {
      this.screenList.push({
        ...DEFAULT_SCREENS.NO_LIST,
        message,
      });
    }
  };

  private processServerList = (serverList: ScreenItem[]): string[] => {
    const parseErrors: string[] = [];

    serverList.forEach((screen, index) => {
      // Initialize screen properties
      screen.image = null;
      screen.nextUpdate = 0;
      screen.imageUri = '';
      screen.message = '';

      const errors = validateScreenItem(screen, index);
      if (errors.length > 0) {
        parseErrors.push(...errors);
        return;
      }

      // Skip if not enabled
      if (!screen.enabled) {
        console.log(`Sequence: Skipping: ${screen.friendlyName}`);
        return;
      }

      // Set default timeBug if undefined
      if (typeof screen.timeBug === 'undefined') {
        screen.timeBug = '';
      }

      // Handle batch resources (e.g., [01:10])
      if (screen.resource.includes('[01:10]')) {
        this.processBatchResource(screen);
      } else {
        this.screenList.push(screen);
        console.log(`Sequence: Adding: ${screen.friendlyName} - ${screen.resource}`);
      }
    });

    return parseErrors;
  };

  private processBatchResource = (screen: ScreenItem): void => {
    for (let i = 1; i <= 10; i++) {
      const newScreen = JSON.parse(JSON.stringify(screen)) as ScreenItem;
      
      const indexStr = i.toString().padStart(2, '0');
      const newResource = screen.resource.replace('[01:10]', indexStr);
      
      newScreen.resource = newResource;
      newScreen.friendlyName = `${screen.friendlyName}-${indexStr}`;

      this.screenList.push(newScreen);
      console.log(`Sequence: Adding: ${newScreen.friendlyName} - ${newResource}`);
    }
  };

  private update = async (): Promise<void> => {
    console.log('Sequence::update - ********************** Starting *********************');
    
    const now = Date.now();
    
    if (!this.screenList?.length) {
      console.log('ScreenList is empty. Skipping update');
      return;
    }

    const updatePromises = this.screenList.map(async screen => {
      if (typeof screen.nextUpdate === 'undefined') {
        console.log('Sequence::update screen.nextUpdate is undefined, Setting to now.');
        screen.nextUpdate = now;
      }

      if (screen.nextUpdate <= now) {
        await this.updateScreen(screen, now);
      } else {
        const timeRemaining = formatTimeRemaining(screen.nextUpdate - now);
        const formattedName = padScreenName(screen.friendlyName);
        console.log(
          `Sequence::update: ${formattedName} up-to-date, ${timeRemaining} to go`
        );
      }
    });

    await Promise.allSettled(updatePromises);
  };

  private updateScreen = async (screen: ScreenItem, now: number): Promise<void> => {
    console.log(`Sequence::update: Time to update: ${screen.resource}`);

    const options: AxiosRequestConfig = {
      responseType: 'arraybuffer',
      timeout: APP_CONFIG.REQUEST_TIMEOUT_MS,
    };

    try {
      const response: AxiosResponse = await axios.get(screen.resource, options);
      const screenData = response.data;

      if (screenData) {
        await this.processImageData(screen, screenData, now);
      }
    } catch (error) {
      this.handleUpdateError(screen, error, now);
    }
  };

  private processImageData = async (
    screen: ScreenItem,
    screenData: ArrayBuffer,
    now: number
  ): Promise<void> => {
    const imageString = Buffer.from(screenData, 'binary').toString('base64');
    const type = getImageTypeFromBase64(imageString);

    if (!type) {
      console.error(`Sequence::update: ${screen.resource} - unknown image type`);
      screen.message = `${screen.friendlyName}: Unknown image type`;
      return;
    }

    const image = new Image();
    const imgStr = createDataUri(imageString, type);

    return new Promise<void>((resolve) => {
      image.onload = () => {
        screen.image = image;
        screen.imageUri = imgStr;
        screen.nextUpdate = now + (screen.refreshMinutes * 60 * 1000);
        resolve();
      };

      image.onerror = () => {
        console.error(`Sequence::update: ${screen.resource} image.onerror`);
        screen.image = null;
        screen.message = `${screen.friendlyName}: Failed to load image data`;
        resolve();
      };

      image.src = imgStr;
    });
  };

  private handleUpdateError = (screen: ScreenItem, error: unknown, now: number): void => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.warn(`Sequence::update GET result ${error.response.status}`);
      } else {
        console.warn('Sequence::update GET result NULL');
      }
    }

    // Retry in 10 minutes
    screen.nextUpdate = now + (APP_CONFIG.ERROR_RETRY_DELAY_MINUTES * 60 * 1000);
  };

  public getFirst = (): ScreenItem => {
    return {
      ...DEFAULT_SCREENS.STARTING,
      imageUri: `${process.env.PUBLIC_URL}/dawn.jpg`,
    };
  };

  public getNext = (): ScreenItem => {
    if (this.screenList.length === 0) {
      return DEFAULT_SCREENS.STILL_STARTING;
    }

    let item = this.screenList[this.nextIndex];
    this.nextIndex = (this.nextIndex + 1) % this.screenList.length;

    // Find next non-null image
    const startingIndex = this.nextIndex;
    while (item.image === null) {
      console.warn(`Skipping ${item.friendlyName} since the image is null`);
      
      item = this.screenList[this.nextIndex];
      this.nextIndex = (this.nextIndex + 1) % this.screenList.length;

      // Prevent infinite loop
      if (startingIndex === this.nextIndex) {
        console.warn('All screen items had null images, show the "No images..." screen');
        return DEFAULT_SCREENS.NO_IMAGES;
      }
    }

    return item;
  };
}
