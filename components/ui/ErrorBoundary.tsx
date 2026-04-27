import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught an error:", error, errorInfo.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            出现了一些问题
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300 mb-3 text-center max-w-md">
            组件渲染时发生了错误，请尝试重新加载页面。
          </p>
          {this.state.error && (
            <details className="w-full max-w-md mb-3">
              <summary className="text-xs text-red-500 dark:text-red-400 cursor-pointer">
                查看错误详情
              </summary>
              <pre className="mt-1 p-2 text-xs bg-red-100 dark:bg-red-900/50 rounded overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReload}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            重新加载
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
