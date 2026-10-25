/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import type { Type } from '@nestjs/common';

export class SubsonicResponseDto {
  @ApiProperty({ type: String })
  declare status: string;

  @ApiProperty({ type: String })
  declare version: string;
}

/**
 * Builds (once per response DTO) a uniquely named class wrapping the response in the
 * "subsonic-response" key.  A real class is required because generics are erased at runtime.
 */
export function SubsonicResponseEnvelopeDtoFactory<T extends SubsonicResponseDto>(model: Type<T>) {
  class Envelope {
    @ApiProperty({ type: model })
    declare 'subsonic-response': T;
  }
  Object.defineProperty(Envelope, 'name', { value: `${model.name.replace(/Dto$/, '')}EnvelopeDto` });
  return Envelope;
}
