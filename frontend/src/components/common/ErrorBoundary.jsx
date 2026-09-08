import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]:', error, errorInfo);
    if (this.props.onError) this.props.onError(error, errorInfo);
  }

  resetError = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.resetError)
          : this.props.fallback;
      }
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
