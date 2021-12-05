import {ConnectionTransport} from 'puppeteer-core';

interface CDPCommand {
  id: number;
  method: string;
  params: any;
  sessionId?: string;
}

interface CDPCommandResponse extends CDPCommand {
  error?: {
    message?: string;
  };
  result?: any;
}

interface CDPEvent {
  method: string;
  params: any;
  sessionId?: string;
}

class ExtensionDebuggerTransport implements ConnectionTransport {
  target: chrome.debugger.TargetInfo;
  debugee: chrome.debugger.Debuggee;

  // feel free to adjust this
  responseDelay = 0.03 * 1000;

  private _sessionId: string;

  onmessage?: (message: string) => void;
  onclose?: () => void;

  static create(tabId: number): Promise<ExtensionDebuggerTransport> {
    if (chrome.debugger) {
      const debugee: chrome.debugger.Debuggee = {
        tabId: tabId,
      };
      return new Promise((resolve, reject) => {
        chrome.debugger.attach(debugee, '1.3', async () => {
          const error = chrome.runtime.lastError;
          if (!error) {
            const target = await this._getTargetInfo(debugee);
            const transport = new ExtensionDebuggerTransport(target);
            resolve(transport);
          } else {
            reject(error);
          }
        });
      });
    } else {
      throw new Error('no debugger permission');
    }
  }

  constructor(target: chrome.debugger.TargetInfo) {
    this.target = target;
    this._sessionId = target.id;
    this.debugee = {
      tabId: target.tabId,
    };

    chrome.debugger.onEvent.addListener((source, method, params) => {
      const event: CDPEvent = {
        method: method,
        params: params,
        sessionId: this._sessionId,
      };
      source.tabId === this.target.tabId ? this._emit(event) : null;
    });

    chrome.debugger.onDetach.addListener(source => {
      source.tabId === this.target.tabId ? this._closeTarget() : null;
    });
  }

  send(message: string): void {
    const command: CDPCommand = JSON.parse(message);
    const targetCommands = [
      'Target.getBrowserContexts',
      'Target.setDiscoverTargets',
      'Target.attachToTarget',
      'Target.activateTarget',
      'Target.closeTarget',
    ];
    if (targetCommands.includes(command.method)) {
      this._handleTargetCommand(command);
    } else {
      chrome.debugger.sendCommand(
        this.debugee,
        command.method,
        command.params,
        result => this._handleCommandResponse(command, result)
      );
    }
  }

  close(): void {
    chrome.debugger.detach(this.debugee, () => this._closeTarget());
  }

  private static _getTargetInfo(
    debugee: chrome.debugger.Debuggee
  ): Promise<chrome.debugger.TargetInfo> {
    return new Promise((resolve, reject) => {
      chrome.debugger.getTargets(targets => {
        const target = targets
          .filter(target => target.attached && target.tabId === debugee.tabId)
          .map(target => {
            return {
              ...target,
              targetId: target.id,
              canAccessOpener: false,
            };
          });
        target[0] ? resolve(target[0]) : reject(new Error('target not found'));
      });
    });
  }

  private _handleCommandResponse(command: CDPCommand, result: any) {
    const error = chrome.runtime.lastError;
    const response: CDPCommandResponse = {
      ...command,
      error: error,
      result: result,
    };
    this._delaySend(response);
  }

  private _handleTargetCommand(command: CDPCommand) {
    const response: CDPCommandResponse = {
      ...command,
      error: undefined,
      result: {},
    };
    switch (command.method) {
      case 'Target.getBrowserContexts':
        response.result = {
          browserContextIds: [],
        };
        break;

      case 'Target.setDiscoverTargets':
        response.result = null;
        this._emitTargetCreated();
        break;

      case 'Target.attachToTarget':
        response.result = {
          sessionId: this._sessionId,
        };
        this._emitTargetAttached();
        break;

      case 'Target.activateTarget':
        response.result = null;
        break;

      case 'Target.closeTarget':
        response.result = {
          success: true,
        };
        setTimeout(() => this.close(), this.responseDelay);
        break;
    }
    this._delaySend(response);
  }

  private _emitTargetCreated() {
    const event: CDPEvent = {
      method: 'Target.targetCreated',
      params: {
        targetInfo: this.target,
      },
    };
    this._emit(event);
  }

  private _emitTargetAttached() {
    const event: CDPEvent = {
      method: 'Target.attachedToTarget',
      params: {
        targetInfo: this.target,
        sessionId: this._sessionId,
        waitingForDebugger: false,
      },
    };
    this._emit(event);
  }

  private _emitTargetDetached() {
    const event: CDPEvent = {
      method: 'Target.detachedFromTarget',
      params: {
        targetId: this.target.id,
        sessionId: this._sessionId,
      },
    };
    this._emit(event);
  }

  private _closeTarget() {
    this._emitTargetDetached();
    this.onclose?.call(null);
  }

  private _emit(event: CDPEvent) {
    this?.onmessage?.call(null, JSON.stringify(event));
  }

  private _delaySend(response: CDPCommandResponse) {
    setTimeout(() => {
      this?.onmessage?.call(null, JSON.stringify(response));
    }, this.responseDelay);
  }
}

export default ExtensionDebuggerTransport;
