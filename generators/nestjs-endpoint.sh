#!/bin/bash
# eg: ./nestjs-endpoint.sh ApiAccounts accounts api 
SERVICE_CLASS=$1
SERVICE_FILE=$2
API_PATH=$3
OVERWRITE=$4
FILE_PATH=./src/${API_PATH}/${SERVICE_FILE}
SERVICE_REFERENCE=$SERVICE_CLASS
SERVICE_REFERENCE=${SERVICE_REFERENCE/Api/}

if [ -z $SERVICE_CLASS ]; then
  echo npm run generate:endpoint ApiAccounts accounts api 
  exit 0
fi

if [ -f "$FILE_PATH/${SERVICE_FILE}.controller.ts" ] && [ "$OVERWRITE" != "--overwrite" ]; then
  echo "Error: Controller file already exists at $FILE_PATH/${SERVICE_FILE}.controller.ts"
  echo "Use the --overwrite flag to overwrite existing files."
  exit 1
fi

echo "Generating endpoint for $SERVICE_CLASS at $FILE_PATH"

mkdir -p $FILE_PATH
mkdir -p $FILE_PATH/dtos

# The module file
cat <<EOF > $FILE_PATH/${SERVICE_FILE}.module.ts
import { ${SERVICE_CLASS}Controller } from './${SERVICE_FILE}.controller';
import { ${SERVICE_CLASS}Service } from './${SERVICE_FILE}.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [${SERVICE_CLASS}Controller],
  providers: [${SERVICE_CLASS}Service],
})
export class ${SERVICE_CLASS}Module {}
EOF

# The DTO file
echo "" > $FILE_PATH/dtos/index.ts

# The Service file
cat <<EOF > $FILE_PATH/${SERVICE_FILE}.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${SERVICE_CLASS}Service {
  constructor() { }
}
EOF

# The Controller file
cat <<EOF > $FILE_PATH/${SERVICE_FILE}.controller.ts
import { ApiEndpoint } from '../api.decorator';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ${SERVICE_CLASS}Service } from './${SERVICE_FILE}.service';
import { SuccessResponseDto, BadRequestResponseDto, NotFoundResponseDto, InternalServerErrorResponseDto } from 'src/api/response.dto';

@Controller('api')
export class ${SERVICE_CLASS}Controller {
  constructor(private readonly ${SERVICE_REFERENCE,,}Service: ${SERVICE_CLASS}Service) { }

  // eslint-disable-next-line class-methods-use-this
  @ApiEndpoint(Get, 'url-path', HttpStatus.OK, {
    summary: '',
    description: '',
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.BAD_REQUEST]: BadRequestResponseDto,
      [HttpStatus.NOT_FOUND]: NotFoundResponseDto,
      [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorResponseDto,
    },
  })
  async get() {
  }
}
EOF

npx eslint ${FILE_PATH}/*.ts --fix
