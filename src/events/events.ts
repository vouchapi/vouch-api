import { profile, vouch as VouchType } from '../drizzle/schema';

export const Events = {
  ProfileCreated: 'profile.created',
  ProfileUpdated: 'profile.updated',
  VouchCreated: 'vouch.created',
  VouchUpdated: 'vouch.updated'
};

export class ProfileCreatedEvent {
  constructor(public profiles: (typeof profile.$inferSelect)[]) {}
}

export class ProfileUpdatedEvent {
  constructor(
    public oldProfiles: typeof profile.$inferSelect,
    public newProfiles: typeof profile.$inferSelect
  ) {}
}

export class VouchCreatedEvent {
  constructor(public vouch: typeof VouchType.$inferSelect) {}
}

export class VouchUpdatedEvent {
  constructor(
    public oldVouch: typeof VouchType.$inferSelect,
    public newVouch: typeof VouchType.$inferSelect
  ) {}
}
