import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';

export function BaseApiCreatedResponses() {
  return applyDecorators(
    ApiCreatedResponse({ description: ReasonPhrases.CREATED }),
    ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED }),
    ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN }),
    ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST }),
    ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND }),
  );
}

export function BaseApiUserOkResponses() {
  return applyDecorators(
    ApiOkResponse({ description: ReasonPhrases.OK }),
    ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND }),
    ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED }),
  );
}

export function BaseApiAdminOkResponses() {
  return applyDecorators(
    ApiOkResponse({ description: ReasonPhrases.OK }),
    ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN }),
    ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND }),
    ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED }),
    ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST }),
  );
}
