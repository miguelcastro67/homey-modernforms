import type FanDirection from './FanDirection';

interface FanState {
    clientId: string;

    fanOn: boolean;
    fanSpeed: number;
    fanDirection: FanDirection;

    lightOn: boolean;
    lightBrightness: number;

    wind: boolean;
    windSpeed: number;
}

export default FanState;

