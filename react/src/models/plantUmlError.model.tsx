export interface IRenderPngErrorResponse {
  duration: number
  status: string
  line?: number
  exception?: string
  error?: string
}

export interface IPlantUmlError
  extends Pick<IRenderPngErrorResponse, 'duration' | 'status'> {
  line?: number
  message: string
}
