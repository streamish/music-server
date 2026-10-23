import { AuthenticationService } from 'src/authentication/authentication.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';

function decodePassword(value: string): string {
  if (!value.startsWith('enc:')) {
    return value;
  }
  const hex = value.slice(4);
  if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) {
    throw new UnauthorizedException('Malformed encoded password');
  }
  return Buffer.from(hex, 'hex').toString('utf8');
}

// TODO: there are three subsonic authentication methods -
//
// 1) username + encoded password (p parameter)
// 2) username + token (t parameter) + salt (s parameter)
// 3) API key (apiKey parameter)
//
// For now only the first method is supported but this is nonexistent security.
//
// The second method cannot be supported as passwords are irreversibly hashed
// before saving in the database and it requires md5 hashing the plain text
// with specified salt for comparison.
//
// The third method (API key) is not implemented yet, it requires a method of
// creating and managing GUID keys which needs UI, database migration and API
// endpoints to facilitate.
//
// TODO: There is also the option to provide a certificate to the Subsonic client
// which will be used for encrypting the request payload or credentials, presumably
// in a similar fashion to Synology.
//
// TODO: there is no mechanism for passing sessions because the user is authenticated
// on every request rather than persisting a session.  There aren't really any
// ramifications here because other parts of the API won't accept this scheme anyway
// but it does mean there is no record of sessions, which might require rethinking
// the UI to provide oversight.

@Injectable()
export class SubsonicAuthGuard implements CanActivate {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { u: username, p: password } = request.query as Record<string, string>;
    if (!username || !password) {
      throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
    }
    const user = await this.authenticationService.getAccountByUsername(username);
    const decodedPassword = decodePassword(password);
    const authenticated = await this.authenticationService.verifyPassword(user.id, decodedPassword);
    if (!authenticated) {
      throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
    }
    request.user = user;
    return true;
  }
}
