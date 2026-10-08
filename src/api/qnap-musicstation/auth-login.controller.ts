/* eslint-disable max-classes-per-file */
import { Body, Get, HttpStatus, Ip, Post, Query, Req } from '@nestjs/common';
import { IntersectionType, PartialType } from '@nestjs/swagger';
import { QNAP_POST_TO_GET } from 'src/constants/swagger';
import { QnapApiEndpoint, QnapController } from './qnap.decorator';
import {
  QnapAuthLoginAuthenticateQueryDto,
  QnapAuthLoginDto,
  QnapAuthLoginExistingLoginQueryDto,
  QnapAuthLoginFailedDto,
  QnapAuthLoginResumeSessionQueryDto,
  QnapAuthResumeSessionDto,
  QnapPreauthenticateDto,
} from './dtos/auth-login.dto';
import { QnapAuthLoginService } from './auth-login.service';
import { objectToXml } from 'src/utils/xml';
import type { Request } from 'express';

class QnapAuthLoginQueryDto extends PartialType(
  IntersectionType(
    QnapAuthLoginAuthenticateQueryDto,
    QnapAuthLoginResumeSessionQueryDto,
    QnapAuthLoginExistingLoginQueryDto,
  ),
) {}

@QnapController({ allowGuest: true })
export class QnapAuthLoginController {
  constructor(private readonly authLoginService: QnapAuthLoginService) {}

  // iOS posts to this endpoint
  @QnapApiEndpoint(Post, 'authLogin.cgi', HttpStatus.OK, {
    summary: 'QNAP authentication handler (iPhone)',
    description: [
      'Handles various QNAP Music Station authentication requests.',
      'Preauthentication requests return password configuration and system information.',
      'Authentication requests validate the username and password, which is sent base-64 encoded.',
      'Validating sessions confirms a JWT token and returns system configuration information.',
      'Resuming sessions does not validate the JWT token and returns system configuration information.',
      QNAP_POST_TO_GET,
    ].join(' '),
    responses: {
      [HttpStatus.OK]: [QnapPreauthenticateDto, QnapAuthLoginDto, QnapAuthLoginFailedDto, QnapAuthResumeSessionDto],
    },
    extraModels: [
      QnapAuthLoginAuthenticateQueryDto,
      QnapAuthLoginResumeSessionQueryDto,
      QnapAuthLoginExistingLoginQueryDto,
      QnapAuthResumeSessionDto,
      QnapPreauthenticateDto,
      QnapAuthLoginDto,
      QnapAuthLoginFailedDto,
    ],
  })
  async postRequest(@Req() req: Request, @Ip() ipAddress: string, @Body() body: QnapAuthLoginQueryDto) {
    return this.routeRequest(req, ipAddress, body);
  }

  // Android does a GET request
  @QnapApiEndpoint(Get, 'authLogin.cgi', HttpStatus.OK, {
    summary: 'QNAP authentication handler',
    description: [
      'Handles various QNAP Music Station authentication requests.',
      'Preauthentication requests return password configuration and system information.',
      'Authentication requests validate the username and password, which is sent base-64 encoded.',
      'Validating sessions confirms a JWT token and returns system configuration information.',
      'Resuming sessions does not validate the JWT token and returns system configuration information.',
      'The Android QMusic app uses `GET` and querystring parameters, the iPhone app `POST` and uses the `POST` body.',
    ].join(' '),
    isAuthenticated: false,
    responses: {
      [HttpStatus.OK]: [QnapPreauthenticateDto, QnapAuthLoginDto, QnapAuthLoginFailedDto, QnapAuthResumeSessionDto],
    },
    extraModels: [
      QnapAuthLoginAuthenticateQueryDto,
      QnapAuthLoginResumeSessionQueryDto,
      QnapAuthLoginExistingLoginQueryDto,
      QnapAuthResumeSessionDto,
      QnapPreauthenticateDto,
      QnapAuthLoginDto,
      QnapAuthLoginFailedDto,
    ],
  })
  async routeRequest(@Req() req: Request, @Ip() ipAddress: string, @Query() variousQueries: QnapAuthLoginQueryDto) {
    // console.log('authLogin.cgi', { query: variousQueries });
    const userAgent = req.headers['user-agent'] || '';
    // Route #1:  resuming session
    if (variousQueries.sid) {
      const query = variousQueries as QnapAuthLoginResumeSessionQueryDto;
      const data = await this.authLoginService.resumeSession(query.sid, ipAddress);
      // console.log('xml #1', objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot'));
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #2:  authentication
    if (variousQueries.user && variousQueries.pwd) {
      const query = variousQueries as QnapAuthLoginAuthenticateQueryDto;
      const data = await this.authLoginService.authenticate(userAgent, query);
      // console.log('xml #2', objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot'));
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #3:  existing login
    if (variousQueries.qtoken) {
      const query = variousQueries as QnapAuthLoginExistingLoginQueryDto;
      const data = await this.authLoginService.validateExistingSession(query.qtoken);
      // console.log('xml #3', objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot'));
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #4:  pre-authentication
    const data = this.authLoginService.preauthenticate();
    // console.log('xml #4', objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot'));
    return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
