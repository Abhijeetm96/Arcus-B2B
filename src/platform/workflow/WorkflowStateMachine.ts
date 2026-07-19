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

  /**
   * Evaluates and fires a state transition if valid and guards pass.
   */
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

    // Evaluate Guard if registered
    if (stateConfig.guard && !stateConfig.guard(context)) {
      throw new Error(`Transition guard failed. Conditions are not met for event: ${String(event)}`);
    }

    // Call exit trigger on current state
    if (stateConfig.exit) {
      stateConfig.exit(context);
    }

    const oldState = this.currentState;
    this.currentState = targetState;

    // Call entry trigger on target state
    const targetConfig = this.states[targetState];
    if (targetConfig && targetConfig.entry) {
      targetConfig.entry(context);
    }

    // Record transition history
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
