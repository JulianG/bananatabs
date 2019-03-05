import * as CoreMutations from '../core/CoreMutations';
import { SessionProvider } from '../core/SessionProvider';
import { WindowMutator } from '../core/Mutators';
import { BrowserController } from '../browsercontroller/BrowserController';

export class DefaultWindowMutator implements WindowMutator {
  constructor(
    private provider: SessionProvider,
    private browser: BrowserController
  ) { }

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
    const win = this.provider.session.getWindow(id);
    const visibleTabs = win.tabs.filter(t => t.visible).length;
    
    if(visibleTabs === 0) {
      return;
    }

    const session = this.provider.session;

    await this.browser.showWindow(session.getWindow(id));

    await this.provider.setSession(
      CoreMutations.mutateWindow(session, id, {
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
