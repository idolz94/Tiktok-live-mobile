import { act, render } from "@testing-library/react-native";
import { AnimatedErrorText } from ".";

jest.mock("@hooks/use-theme", () => ({
  useThemes: () => ({
    colors: { error: "#EF4444" },
    textPresets: { fs12_400: { fontSize: 12 } },
  }),
}));

describe("AnimatedErrorText", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("renders no text when no message", async () => {
    const { queryByText } = await render(<AnimatedErrorText />);
    expect(queryByText("Field required")).toBeNull();
  });

  it("shows message after 500ms debounce", async () => {
    const { queryByText } = await render(<AnimatedErrorText message="Field required" />);
    expect(queryByText("Field required")).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(queryByText("Field required")).not.toBeNull();
  });

  it("clears immediately when message prop removed", async () => {
    const { queryByText, rerender } = await render(<AnimatedErrorText message="Field required" />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(queryByText("Field required")).not.toBeNull();

    await act(async () => {
      await rerender(<AnimatedErrorText />);
    });
    expect(queryByText("Field required")).toBeNull();
  });
});
