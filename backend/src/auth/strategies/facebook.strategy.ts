import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret = configService.get<string>('FACEBOOK_APP_SECRET');
    
    if (!clientID || !clientSecret) {
      throw new Error('Facebook OAuth credentials are not configured');
    }
    
    super({
      clientID,
      clientSecret,
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:3001/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      state: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    if(!emails || !emails[0] || !emails[0].value) {
      return done(new Error('No email found in Facebook profile. Please grant email permission.'), null);
    }
    
    const user = {
      provider: 'facebook',
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName || null,
      lastName: name?.familyName || null,
      avatarUrl: photos?.[0]?.value || null,
      accessToken,
    };
    
    done(null, user);
  }
}
