import * as CoreMutations from '../core/CoreMutations';
import { SessionProvider } from '../SessionProvider';
import { TabMutator } from './TabMutator';
import { WindowMutator } from './WindowMutator';
import { BrowserController } from './BrowserController';

export class WindowAndTabMutator implements TabMutator, WindowMutator {
  constructor(
    private provider: SessionProvider,
    private browser: BrowserController
  ) {}

  // TabMutator interface

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
        visible: false
      })
    );
  }

  async showTab(winId: number, tabId: number) {
    const session = this.provider.session;
    const wasWindowVisible = session.getWindow(winId).visible;
    const newSession = CoreMutations.mutateTab(session, winId, tabId, {
      visible: true
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

  /// WindowMutator

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
