export const classAppearance = {
  extend: false,
  className: {
    anchor:
      "!text-muted-foreground hover:!text-brand !underline !underline-offset-4",
    button:
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2",
    container: "flex flex-col gap-2",
    divider: "!bg-input",
    input:
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    label: "flex flex-col !mb-2 !text-xs hover:!cursor-pointer",
    loader: "w-4 h-4 mr-2 animate-spin",
    message: "flex justify-center mx-auto !text-red-600 text-sm",
  },
};
