import { EchoFeedbackElement } from './echo-feedback-element';
import './themes/base.css';

// Auto-register the custom element
if (!customElements.get('echo-feedback')) {
  customElements.define('echo-feedback', EchoFeedbackElement);
}

export { EchoFeedbackElement };
export type { EchoFeedbackEventMap } from './types';
