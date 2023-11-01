import { HttpException, HttpStatus } from '@nestjs/common';

const VouchExceptions = {
  PROFILE_NOT_FOUND: {
    error: 404,
    message: 'Profile not found'
  },
  AUTH_HEADER_MISSING: {
    error: 401,
    message: 'Authorization header missing. Required KEY & CLIENT'
  },
  MISSING_PROFILE_ID: {
    error: 400,
    message: 'Missing profile id'
  },
  MISSING_PROFILE_USERNAME: {
    error: 400,
    message: 'Missing profile username'
  },
  UPDATE_PROFILE_USER_ID_NOT_ALLOWED: {
    error: 400,
    message: 'userId cannot be updated. user /transfer to transfer ownership'
  },
  MISSING_VOUCH_ID: {
    error: 400,
    message: 'Missing vouch id. Required vouchId'
  },
  MISSING_VOUCH_DETAILS: {
    error: 400,
    message: 'Missing vouch details. Required vouch details'
  },
  INVALID_VOUCH_ACTIVITY_BODY: {
    error: 400,
    message: 'To change vouch state you must provide a valid activity body'
  },
  INVALID_VOUCH_PROOF_ACTIVITY_BODY: {
    error: 400,
    message:
      'To change vouch proof state you must provide a valid activity body with "who"'
  },
  LICENSE_ALREADY_REGISTERED: {
    error: 400,
    message: 'License already registered with this client name.'
  },
  LICENSE_REGISTRATION_FAILED: {
    error: 500,
    message: 'Failed to register license.'
  },
  UNAUTHORIZED: {
    error: 401,
    message: 'Unauthorized'
  },
  VOUCH_NOT_FOUND: {
    error: 404,
    message: 'Vouch not found with this id.'
  },
  VOUCH_STATUS_CANNOT_BE_UNCHECKED: {
    error: 400,
    message: 'Vouch status cannot be unchecked.'
  },
  VOUCH_APPROVED_CANNOT_BE_DENIED: {
    error: 400,
    message: 'Vouch approved cannot be denied.'
  },
  VOUCH_APPROVED_CANNOT_BE_ASKED_FOR_PROOF: {
    error: 400,
    message: 'Vouch approved cannot be asked for proof.'
  }
};

export class APIException extends HttpException {
  constructor(type: keyof typeof VouchExceptions) {
    super(VouchExceptions[type], HttpStatus.BAD_GATEWAY);
  }
}
