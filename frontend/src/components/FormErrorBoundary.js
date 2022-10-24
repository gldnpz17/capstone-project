import React from "react";

class FormErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidUpdate(props) {
    if (this.props.editorContent !== props.editorContent) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return <div>Error rendering form.</div>
    }

    return this.props.children; 
  }
}

export { FormErrorBoundary }