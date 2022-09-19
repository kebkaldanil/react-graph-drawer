export function CustomError(): ClassDecorator {
  return (target) => void (target.prototype.name = target.name);
}
