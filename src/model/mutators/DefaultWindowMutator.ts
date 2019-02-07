import * as CoreMutations from '../core/CoreMutations';
import { SessionProvider } from '../SessionProvider';
import { WindowMutator } from './Mutators';
import { BrowserController } from '../browsercontroller/BrowserController';

export class DefaultWindowMutator implements WindowMutator {
  constructor(
    private provider: SessionProvider,
    private browser: BrowserController
  ) {}

  async renameWindow(id: number, title: string) {
    await this.provider.setSession(
      CoreMutations.mutateWindow(this.provider.session, id, { title })
    );
  }

  async collapseWindow(id: number) {
    await this.provider.setSession(
      CoreMutations.mutateWindow(this.provider.session, id, { expanded: false })
    );
  }

  async expandWindow(id: number) {
    await this.provider.setSession(
      CoreMutations.mutateWindow(this.provider.session, id, { expanded: true })
    );
  }

  async hideWindow(id: number) {
    await this.browser.closeWindow(id);

    await this.provider.setSession(
      CoreMutations.mutateWindow(this.provider.session, id, {
        visible: false
      })
    );
  }

  async showWindow(id: number) {
    await this.browser.showWindow(this.provider.session.getWindow(id));

    await this.provider.setSession(
      CoreMutations.mutateWindow(this.provider.session, id, {
        visible: true
      })
    );
  }

  async deleteWindow(id: number) {
    await this.browser.closeWindow(id);

    await this.provider.setSession(
      CoreMutations.deleteWindow(this.provider.session, id)
    );
  }
}
