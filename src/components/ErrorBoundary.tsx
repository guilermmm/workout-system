import { Component } from "react";

export default class ErrorBoundary extends Component<{
  fallback: JSX.Element;
  children: JSX.Element;
}> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError<T>(error: T) {
    return {
      hasError: true,
      error,
    };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
