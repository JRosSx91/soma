import {
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { UsersService } from "../users/users.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { CodedConflictException } from "../common/exceptions/coded-exception.js";
import { normalizeEmail } from "./normalize-email.js";

const SALT_ROUNDS = 10;

/**
 * The JWT payload Soma stores in tokens. Kept minimal:
 *   sub: the user id (standard JWT claim).
 *   email: convenience for displaying current user without an extra
 *          query when handling requests.
 */
export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthenticatedResponse> {
    const email = normalizeEmail(dto.email);
    const existing = await this.usersService.findByEmailInsensitive(email);

    if (existing.status === "collision") {
      // Do not merge identities or pick a winner. Refuse registration
      // for this address until an operator resolves the duplicate rows.
      this.logger.error(
        `Email collision on register (${existing.count} rows). Refusing new account.`,
      );
      throw new CodedConflictException(
        "AUTH_EMAIL_EXISTS",
        "Email already registered",
      );
    }

    if (existing.status === "found") {
      throw new CodedConflictException(
        "AUTH_EMAIL_EXISTS",
        "Email already registered",
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.usersService.create({
      email,
      hashedPassword,
      displayName: dto.displayName,
      biologicalSex: dto.biologicalSex,
      birthYear: dto.birthYear,
      weightKg: dto.weightKg,
    });

    return this.buildAuthResponse(user.id, user.email, user.displayName);
  }

  async login(dto: LoginDto): Promise<AuthenticatedResponse> {
    const email = normalizeEmail(dto.email);
    const lookup = await this.usersService.findByEmailInsensitive(email);

    if (lookup.status === "collision") {
      // Same client-facing error as bad credentials — do not reveal
      // the data-integrity problem to the caller.
      this.logger.error(
        `Email collision on login (${lookup.count} rows). Refusing authentication.`,
      );
      throw new UnauthorizedException("Invalid credentials");
    }

    if (lookup.status === "none") {
      // Same error for both cases to avoid leaking whether the email
      // is registered.
      throw new UnauthorizedException("Invalid credentials");
    }

    const user = lookup.user;
    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildAuthResponse(user.id, user.email, user.displayName);
  }

  private buildAuthResponse(
    userId: string,
    email: string,
    displayName: string,
  ): AuthenticatedResponse {
    const payload: JwtPayload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: userId,
        email,
        displayName,
      },
    };
  }
}
