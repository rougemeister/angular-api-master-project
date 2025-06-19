import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appNoProfanity]',
  providers: [{ provide: NG_VALIDATORS, useExisting: NoProfanityValidator, multi: true }]
})
export class NoProfanityValidator implements Validator {
  @Input('appNoProfanity') profanityList: string[] = [];

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.toLowerCase();
    const hasBadWord = this.profanityList.some(word => value.includes(word));
    return hasBadWord ? { profanity: true } : null;
  }
}
