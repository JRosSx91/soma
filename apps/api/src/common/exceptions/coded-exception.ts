import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';

export class CodedConflictException extends ConflictException {
  public readonly code: string;

  constructor(code: string, message: string) {
    super({ message, code });
    this.code = code;
  }
}

export class CodedUnauthorizedException extends UnauthorizedException {
  public readonly code: string;

  constructor(code: string, message: string) {
    super({ message, code });
    this.code = code;
  }
}

export class CodedNotFoundException extends NotFoundException {
  public readonly code: string;

  constructor(code: string, message: string) {
    super({ message, code });
    this.code = code;
  }
}