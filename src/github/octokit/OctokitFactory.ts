import type { OctokitApi } from './OctokitApi';


export type OctokitFactory = (accessToken: string) => OctokitApi;
