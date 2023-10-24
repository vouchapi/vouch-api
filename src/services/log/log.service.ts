import { PostHog } from 'posthog-node';

// 'phc_Gf6HE65V0SgaMPqA4Oyndn4gQJcgbSyIb0OwLE9jsM1',
// { host: 'https://app.posthog.com' }

type VALID_SERVER_EVENTS = {
  PROFILE_REGISTERED: {
    username: string;
    userId: string;
  };
  VOUCH_POSTED: {
    userId: string;
    vouchId: number;
    client: string;
  };
  VOUCH_APPROVE: {
    userId: string;
    vouchId: number;
    client: string;
  };
  VOUCH_DENIED: {
    userId: string;
    vouchId: number;
    client: string;
  };
};

export class PostHogService extends PostHog {
  constructor() {
    super(process.env.POSTHOG_API_KEY, {
      host: 'https://app.posthog.com'
    });
  }

  public track = async <T extends keyof VALID_SERVER_EVENTS>(
    event: T,
    payload: {
      distinctId: string;
      properties: VALID_SERVER_EVENTS[T];
    }
  ) => {
    super.capture({
      event,
      distinctId: payload.distinctId,
      properties: payload.properties
    });
  };
}
