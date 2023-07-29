const bit = 1

export enum ObservableStatus {
  AVAILABLE = bit << 0,
  DISPOSED = bit << 1,
}
