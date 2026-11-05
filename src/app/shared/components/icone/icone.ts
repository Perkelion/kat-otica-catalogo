import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import externalLink from '@tabler/icons/outline/external-link.svg';
import eyeglass from '@tabler/icons/outline/eyeglass-2.svg';
import logout from '@tabler/icons/outline/logout.svg';
import packageIcon from '@tabler/icons/outline/package.svg';
import tags from '@tabler/icons/outline/tags.svg';

const ICONES = {
  'external-link': externalLink,
  eyeglass,
  logout,
  package: packageIcon,
  tags,
};

export type NomeIcone = keyof typeof ICONES;

@Component({
  selector: 'app-icone',
  template: '',
  host: { 'aria-hidden': 'true', '[innerHTML]': 'svg()' },
  styles: `
    :host {
      display: inline-flex;
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
    }
    :host ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icone {
  private readonly sanitizer = inject(DomSanitizer);

  readonly nome = input.required<NomeIcone>();

  protected readonly svg = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICONES[this.nome()]),
  );
}
