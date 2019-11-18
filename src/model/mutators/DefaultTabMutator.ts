import { TabMutator } from '../core/Mutators';
import { SessionProvider } from '../core/SessionProvider';
import * as CoreMutations from '../core/CoreMutations';
import { BrowserController } from '../browsercontroller/BrowserController';

export class DefaultTabMutator implements TabMutator {
  constructor(
    private provider: SessionProvider,
    private browser: BrowserController
  ) {}

  async selectTab(winId: number, tabId: number) {
    await this.browser.selectTab(winId, tabId);

    await this.provider.setSession(
      CoreMutations.selectTab(this.provider.session, winId, tabId)
    );
  }

  async hideTab(winId: number, tabId: number) {
    await this.browser.closeTab(tabId);

    await this.provider.setSession(
      CoreMutations.mutateTab(this.provider.session, winId, tabId, {
        visible: false,
      })
    );
  }

  async showTab(winId: number, tabId: number) {
    const session = this.provider.session;
    const wasWindowVisible = session.getWindow(winId).visible;
    const newSession = CoreMutations.mutateTab(session, winId, tabId, {
      visible: true,
    });

    if (wasWindowVisible) {
      await this.browser.showTab(
        newSession.getWindow(winId),
        newSession.getTab(tabId)
      );
    } else {
      await this.browser.showWindow(newSession.getWindow(winId));
    }
    await this.provider.setSession(newSession);
  }

  async deleteTab(winId: number, tabId: number) {
    await this.browser.closeTab(tabId);

    await this.provider.setSession(
      CoreMutations.deleteTab(this.provider.session, winId, tabId)
    );
  }
}
