import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
