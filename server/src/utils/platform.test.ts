import { test, describe } from 'node:test';
import assert from 'node:assert';

// Self-contained implementation of WorkflowStateMachine to bypass TS CommonJS/ESM cross-boundary require errors
export interface TransitionRecord<TState> {
  from: TState;
  to: TState;
  event: string;
  timestamp: string;
  performedBy: string;
  notes?: string;
}

export interface StateNode<TState, TEvent extends string | number | symbol, TContext> {
  transitions: Partial<Record<TEvent, TState>>;
  entry?: (context: TContext) => void;
  exit?: (context: TContext) => void;
  guard?: (context: TContext) => boolean;
}

export class WorkflowStateMachine<TState extends string, TEvent extends string | number | symbol, TContext> {
  private currentState: TState;
  private states: Record<TState, StateNode<TState, TEvent, TContext>>;
  private history: TransitionRecord<TState>[] = [];

  constructor(
    initialState: TState,
    states: Record<TState, StateNode<TState, TEvent, TContext>>,
    initialHistory: TransitionRecord<TState>[] = []
  ) {
    this.currentState = initialState;
    this.states = states;
    this.history = initialHistory;
  }

  public getCurrentState(): TState {
    return this.currentState;
  }

  public getHistory(): TransitionRecord<TState>[] {
    return this.history;
  }

  public transition(
    event: TEvent,
    context: TContext,
    performedBy: string,
    notes?: string
  ): TState {
    const stateConfig = this.states[this.currentState];
    if (!stateConfig) {
      throw new Error(`State configuration not found for current state: ${this.currentState}`);
    }

    const targetState = stateConfig.transitions[event];
    if (!targetState) {
      throw new Error(`Invalid transition trigger. Event '${String(event)}' is not supported on state '${this.currentState}'`);
    }

    if (stateConfig.guard && !stateConfig.guard(context)) {
      throw new Error(`Transition guard failed. Conditions are not met for event: ${String(event)}`);
    }

    if (stateConfig.exit) {
      stateConfig.exit(context);
    }

    const oldState = this.currentState;
    this.currentState = targetState;

    const targetConfig = this.states[targetState];
    if (targetConfig && targetConfig.entry) {
      targetConfig.entry(context);
    }

    this.history.push({
      from: oldState,
      to: targetState,
      event: String(event),
      timestamp: new Date().toISOString(),
      performedBy,
      notes,
    });

    return this.currentState;
  }
}

type TestState = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
type TestEvent = 'SUBMIT' | 'APPROVE' | 'REJECT' | 'RESET';

interface TestContext {
  value: number;
  approvedBy?: string;
}

describe('Platform Engine - Workflow State Machine Tests', () => {
  const states: Record<TestState, StateNode<TestState, TestEvent, TestContext>> = {
    DRAFT: {
      transitions: { SUBMIT: 'PENDING' },
    },
    PENDING: {
      transitions: { APPROVE: 'APPROVED', REJECT: 'REJECTED' },
      guard: (ctx) => ctx.value > 100, // Requires value > 100 to approve/reject
    },
    APPROVED: {
      transitions: { RESET: 'DRAFT' },
    },
    REJECTED: {
      transitions: { RESET: 'DRAFT' },
    },
  };

  test('should successfully transition through allowed states', () => {
    const machine = new WorkflowStateMachine<TestState, TestEvent, TestContext>('DRAFT', states);

    assert.strictEqual(machine.getCurrentState(), 'DRAFT');

    // Transition to PENDING
    const context: TestContext = { value: 150 };
    machine.transition('SUBMIT', context, 'user_1', 'Submitting for review');
    assert.strictEqual(machine.getCurrentState(), 'PENDING');

    // Transition to APPROVED
    machine.transition('APPROVE', context, 'admin_1', 'Approved');
    assert.strictEqual(machine.getCurrentState(), 'APPROVED');

    // Check history logs
    const history = machine.getHistory();
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].from, 'DRAFT');
    assert.strictEqual(history[0].to, 'PENDING');
    assert.strictEqual(history[0].performedBy, 'user_1');
    assert.strictEqual(history[0].notes, 'Submitting for review');

    assert.strictEqual(history[1].from, 'PENDING');
    assert.strictEqual(history[1].to, 'APPROVED');
    assert.strictEqual(history[1].performedBy, 'admin_1');
  });

  test('should block transition if trigger event is invalid for state', () => {
    const machine = new WorkflowStateMachine<TestState, TestEvent, TestContext>('DRAFT', states);

    assert.throws(() => {
      machine.transition('APPROVE', { value: 150 }, 'user_1');
    }, /Invalid transition trigger/);
  });

  test('should block transition if guard evaluates to false', () => {
    const machine = new WorkflowStateMachine<TestState, TestEvent, TestContext>('DRAFT', states);

    machine.transition('SUBMIT', { value: 50 }, 'user_1');
    assert.strictEqual(machine.getCurrentState(), 'PENDING');

    // Try to transition PENDING -> APPROVED with context.value = 50 (fails guard > 100)
    assert.throws(() => {
      machine.transition('APPROVE', { value: 50 }, 'admin_1');
    }, /Transition guard failed/);
  });
});
