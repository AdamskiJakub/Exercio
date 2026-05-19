import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { StaticConfigService } from '../../config/config.service';

@ValidatorConstraint({ name: 'isValidConfigId', async: false })
@Injectable()
export class IsValidConfigIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly configService: StaticConfigService) {}

  validate(value: string | string[], args: ValidationArguments): boolean {
    const [type] = args.constraints;
    const ids = Array.isArray(value) ? value : [value];

    switch (type) {
      case 'tag':
        return ids.every((id) => this.configService.isValidTag(id));
      case 'specialization':
        return ids.every((id) => this.configService.isValidSpecialization(id));
      case 'goal':
        return ids.every((id) => this.configService.isValidGoal(id));
      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [type] = args.constraints;
    return `One or more ${type} IDs are invalid`;
  }
}

export function IsValidConfigId(
  type: 'tag' | 'specialization' | 'goal',
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [type],
      validator: IsValidConfigIdConstraint,
    });
  };
}
