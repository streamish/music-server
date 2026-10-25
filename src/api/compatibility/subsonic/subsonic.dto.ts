/* eslint-disable max-classes-per-file */
export class SubsonicResponseDto {
  declare status: string;

  declare version: string;
}

export class SubsonicResponseEnvelopeDto<T extends SubsonicResponseDto = SubsonicResponseDto> {
  declare 'subsonic-response': T;
}

export type SubsonicResponseObject = Record<string, unknown>;
