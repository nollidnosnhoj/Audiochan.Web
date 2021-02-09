import {
  array,
  boolean,
  string,
  object,
  SchemaOf,
  mixed
} from 'yup'
import SETTINGS from '~/constants/settings'
import { validationMessages } from '~/utils'
import { EditAudioRequest, UploadAudioRequest } from './types/audio';

const { 
  usernameMinLength,
  usernameMaxLength,
  usernameAllowedChars,
  passwordRequiresDigit: passwordRequireDigit, 
  passwordRequiresLowercase: passwordRequireLowercase, 
  passwordRequiresNonAlphanumeric: passwordRequireNonAlphanumeric, 
  passwordRequiresUppercase: passwordRequireUppercase, 
  passwordMinimumLength: passwordMinLength } = SETTINGS.IDENTITY;

export const usernameRule = (label: string) => {
  let schema = string()
    .test('allowedCharacters', "Username can only contain uppercase, lowercase, numbers, hyphens, or underscores.", (value) => {
      if (value) {
        for(const char of value) {
          if (usernameAllowedChars.indexOf(char) == -1) {
            return false;
          }
        }
      }
      return true;
    }
  );
  if (usernameMinLength) 
    schema = schema.min(usernameMinLength, validationMessages.min(label, usernameMinLength));
  if (usernameMaxLength) 
    schema = schema.max(usernameMaxLength, validationMessages.max(label, usernameMaxLength));
  return schema.defined();
}

export const passwordRule = (label: string) => {
  let schema = string();
  if (passwordMinLength) 
    schema = schema.min(passwordMinLength, validationMessages.min(label, passwordMinLength));
  if (passwordRequireDigit) 
    schema = schema.matches(/^[0-9]+$/, "Password must contain one digit.");
  if (passwordRequireLowercase) 
    schema = schema.matches(/^[a-z]+$/, "Password must contain one lowercase character.");
  if (passwordRequireUppercase) 
    schema = schema.matches(/^[A-Z]+$/, "Password must contain one uppercase character.");
  if (passwordRequireNonAlphanumeric) 
    schema = schema.matches(/^[^a-zA-Z\d]+$/, "Password must contain one non-alphanumeric character.");

  return schema.defined();
}

export const editAudioSchema: SchemaOf<EditAudioRequest> = object().shape({
  title: string()
    .required(validationMessages.required("Title"))
    .max(30, validationMessages.max("Title", 30))
    .defined(),
  description: string()
    .max(500, validationMessages.max("Description", 500))
    .defined(),
  tags: array(string())
    .max(10, validationMessages.max("Tags", 10))
    .ensure()
    .defined(),
  genre: string()
    .required(validationMessages.required("Genre"))
    .defined(),
  isPublic: boolean()
    .defined()
}).defined();

export const uploadAudioSchema: SchemaOf<UploadAudioRequest> = object().shape({
  title: string()
    .max(30, validationMessages.max("Title", 30))
    .defined(),
  description: string()
    .max(500, validationMessages.max("Description", 500))
    .defined(),
  tags: array(string())
    .max(10, validationMessages.max("Tags", 10))
    .ensure()
    .defined(),
  genre: string()
    .defined(),
  isPublic: boolean()
    .defined()
}).defined();