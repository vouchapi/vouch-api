import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Query,
  Request
} from '@nestjs/common';
import { ProfileService } from '../../cache/profile.cache';
import { VouchActivity, profile, vouch } from '../../drizzle/schema';
import { VouchService, VouchesFetchOptions } from '../../cache/vouch.cache';
import { PgInsertValue } from 'drizzle-orm/pg-core';
import { ClientAuthRequest } from '../../middleware/client.auth';

@Controller('v1')
export class Version1Controller {
  constructor(
    private readonly profileService: ProfileService,
    private readonly vouchService: VouchService
  ) {}

  @Get('profiles/:id')
  getProfile(@Param('id') id: string, @Query('username') username?: string) {
    console.log('body' + username);
    return this.profileService.getProfile(id, username);
  }

  @Post('profiles/:id/register')
  registerProfile(@Param('id') id: string, @Body() body: { username: string }) {
    if (!id) {
      return new HttpException('id is required', 400);
    }
    if (!body || !body.username) {
      return new HttpException('username is required', 400);
    }
    return this.profileService.registerProfile(
      [
        {
          userId: id,
          username: body.username
        }
      ],
      true
    );
  }

  @Post('profiles/:id/update')
  updateProfile(
    @Param('id') id: string,
    @Body() body: { username: string } & Partial<typeof profile.$inferSelect>
  ) {
    if (!id) {
      return new HttpException('id is required', 400);
    }
    if (!body || !body.username) {
      return new HttpException('username is required', 400);
    }

    if (body.id) {
      return new HttpException('id cannot be updated', 400);
    }

    if (body.userId) {
      return new HttpException(
        'userId cannot be updated. user /transfer to transfer ownership',
        400
      );
    }

    return this.profileService.updateProfile(id, body.username, body, true);
  }

  @Get('profiles/:id/vouches/:vouchId')
  getVouch(@Param('vouchId') vouchId: string) {
    return this.vouchService.getVouch(parseInt(vouchId));
  }

  @Post('profiles/:id/vouches')
  postVouch(
    @Param('id') id: string,
    @Body() body: PgInsertValue<typeof vouch>,
    @Request() req: ClientAuthRequest
  ) {
    if (!id) {
      return new HttpException('id is required', 400);
    }
    if (!body) {
      return new HttpException('vouch body is required', 400);
    }

    if (!body.client) {
      body.client = req.client;
    }

    return this.vouchService.postVouch(body);
  }

  @Get('vouches')
  getVouches(@Query() query?: VouchesFetchOptions) {
    return this.vouchService.getVouches(query);
  }

  @Get('vouches/:vouchId')
  getVouchById(@Param('vouchId') vouchId: string) {
    return this.vouchService.getVouch(parseInt(vouchId));
  }

  @Post('vouches/:vouchId/approve')
  approveVouch(
    @Param('vouchId') vouchId: string,
    @Body() body: VouchActivity,
    @Request() req: ClientAuthRequest
  ) {
    if (!body) {
      return new HttpException('Invalid body', 400);
    }

    if (!body.vouchId) body.vouchId = parseInt(vouchId);
    if (!body.client) {
      body.client = req.client;
    }

    return this.vouchService.approveVouch(body);
  }

  @Post('vouches/:vouchId/deny')
  denyVouch(
    @Param('vouchId') vouchId: string,
    @Body() body: VouchActivity,
    @Request() req: ClientAuthRequest
  ) {
    if (!body) {
      return new HttpException('Invalid body', 400);
    }
    if (!body.vouchId) body.vouchId = parseInt(vouchId);
    if (!body.client) {
      body.client = req.client;
    }

    return this.vouchService.denyVouch(body);
  }

  @Post('vouches/:vouchId/askproof/:who')
  askProof(
    @Param('vouchId') vouchId: string,
    @Param('who') who: 'RECEIVER' | 'VOUCHER',
    @Body() body: VouchActivity & { who: 'RECEIVER' | 'VOUCHER' },
    @Request() req: ClientAuthRequest
  ) {
    if (!body) {
      return new HttpException('Invalid body', 400);
    }
    if (!body.vouchId) body.vouchId = parseInt(vouchId);

    if (!['RECEIVER', 'VOUCHER'].includes(who)) {
      return new HttpException('Invalid who', 400);
    }

    if (!body.client) {
      body.client = req.client;
    }

    return this.vouchService.askProofVouch({ ...body, who });
  }

  @Post('vouches/:vouchId/update')
  updateVouch(
    @Param('vouchId') vouchId: string,
    @Body() body: Partial<typeof vouch.$inferSelect>,
    @Request() req: ClientAuthRequest
  ) {
    if (!body) {
      return new HttpException('Invalid body', 400);
    }

    if (!body.client) {
      body.client = req.client;
    }

    return this.vouchService.updateVouch(parseInt(vouchId), body, true);
  }

  @Get('leaderboard/top')
  getTop10() {
    return this.profileService.getTop10();
  }

  @Get('leaderboard/hot')
  getHot10() {
    return this.profileService.getHot10();
  }

  @Get('products/:query')
  getProducts(@Param('query') query: string) {
    return this.profileService.searchProduct(query);
  }
}
