/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from './synology.enums';
import { Transform } from 'class-transformer';

export function SynologyBody({
  expectedApi,
  expectedMethod,
  expectedVersion,
  expectedLibrary,
}: {
  expectedApi?: SynologyApiEnum;
  expectedMethod?: SynologyMethodEnum;
  expectedVersion?: number;
  expectedLibrary?: SynologyLibraryEnum;
}) {
  class PostTemplateDto {
    /**
     * Synology's API uses this value to route requests appropriately but this software has
     * direct endpoints for their relevant URL paths.  As such this value is ignored for now
     * but defined to match the Synology API.
     */
    @ApiProperty({
      enum: SynologyApiEnum,
      enumName: 'SynologyApiEnum',
      example: expectedApi,
    })
    @IsEnum(SynologyApiEnum)
    declare api: SynologyApiEnum;

    /**
     * Synology's API uses this value to route requests appropriately but for AudioStation the
     * endpoints have limited functionality, all music-related endpoints `list` except cover
     * images.  As such this value is ignored for now but defined to match the Synology API.
     */
    @ApiProperty({
      enum: SynologyMethodEnum,
      enumName: 'SynologyMethodEnum',
      example: expectedMethod,
    })
    @IsEnum(SynologyMethodEnum)
    declare method: SynologyMethodEnum;

    /**
     * Synology's API has versioned endpoints and some have at least 3 versions.  This software
     * currently only supports the latest version of the API for each endpoint and ignores this value
     * for now.
     *
     * It's possible to build in support for prior versions of an endpoint but that would
     * require using the `debug-proxy` to capture the request and response payloads to understand the
     * differences between versions.
     *
     * If you are running an older DSM NAS and wish to help then check
     * out the GitHub Issues page and submit a request to support your version of the API.
     */
    @ApiProperty({
      example: expectedVersion,
    })
    @Transform(({ value }) => Number.parseInt(value, 10))
    @IsInt()
    declare version: number;

    /**
     * Synology supports having personal and shared libraries but this software does not have a
     * direct equivalent, users can add the same root path to achieve it.  As such this value
     * is ignored but defined to match the Synology API.
     */
    @ApiProperty({
      enum: SynologyLibraryEnum,
      enumName: 'SynologyLibraryEnum',
      example: expectedLibrary,
    })
    @IsEnum(SynologyLibraryEnum)
    declare library: SynologyLibraryEnum;
  }
  return PostTemplateDto;
}

export function SynologyBodyWithPagination({
  expectedApi,
  expectedMethod,
  expectedVersion,
  expectedLibrary,
}: {
  expectedApi?: SynologyApiEnum;
  expectedMethod?: SynologyMethodEnum;
  expectedVersion?: number;
  expectedLibrary?: SynologyLibraryEnum;
}) {
  class PostTemplateWithPaginationDto extends SynologyBody({
    expectedApi,
    expectedMethod,
    expectedVersion,
    expectedLibrary,
  }) {
    /**
     * Defines the number of results to return.  If no value is specified a default of 100,000
     * is used to practically-ensure all results are returned.  This is a change from Synology's
     * API which defaults to 100, but Synology's mobile clients will specify their limit.
     */
    @Transform(({ value }) => Number.parseInt(value, 10))
    @IsInt()
    declare limit: number;

    /**
     * Defines the pagination offset for the results.  If no value is specified a default of 0 is
     * used to start at the beginning of a result set.
     */
    @Transform(({ value }) => Number.parseInt(value, 10))
    @IsInt()
    declare offset: number;
  }
  return PostTemplateWithPaginationDto;
}
