import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "./profile/profile-form";
import type { User } from "@/lib/auth";

// Mock ImageUpload component
vi.mock("@/components/ui/image-upload", () => ({
  ImageUpload: ({ value, onChange, name }: any) => (
    <div data-testid="image-upload">
      {value && <img src={value} alt={name} />}
      <input
        type="file"
        data-testid="file-input"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  ),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useAuth store
const mockUser: User = {
  id: "1",
  email: "john@example.com",
  name: "John Doe",
  role: "user",
  emailVerified: true,
  image: "https://example.com/avatar.jpg",
  bio: "Software developer",
  company: "Tech Corp",
  job_title: "Senior Developer",
  country: "United States",
  phone: "+1234567890",
  website: "https://johndoe.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCheckSession = vi.fn();

vi.mock("@/stores/auth-store", () => ({
  useAuth: () => ({
    user: mockUser,
    checkSession: mockCheckSession,
  }),
}));

// Mock API
vi.mock("@/lib/api", () => ({
  api: {
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "@/lib/api";

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile form with all fields", () => {
    render(<ProfileForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it("pre-populates form with user data", async () => {
    render(<ProfileForm />);

    // Wait for form to populate
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      expect(nameInput.value).toBe("John Doe");
    });

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const bioInput = screen.getByLabelText(/bio/i) as HTMLTextAreaElement;
    const companyInput = screen.getByLabelText(/company/i) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;
    const websiteInput = screen.getByLabelText(/website/i) as HTMLInputElement;

    expect(emailInput.value).toBe("john@example.com");
    expect(bioInput.value).toBe("Software developer");
    expect(companyInput.value).toBe("Tech Corp");
    expect(phoneInput.value).toBe("+1234567890");
    expect(websiteInput.value).toBe("https://johndoe.com");
  });

  it("displays current profile image", async () => {
    render(<ProfileForm />);

    await waitFor(() => {
      const image = screen.queryByRole("img");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });
  });

  it("email field is disabled", () => {
    render(<ProfileForm />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeDisabled();
  });

  it("validates required name field", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      expect(nameInput.value).toBe("John Doe");
    });

    const nameInput = screen.getByLabelText(/full name/i);

    // Clear the name field
    await user.clear(nameInput);
    await user.tab(); // Trigger validation

    await waitFor(() => {
      const error = screen.queryByText(/name must be at least 2 characters/i);
      expect(error).toBeInTheDocument();
    });
  });

  it("handles image file selection", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    const file = new File(["image content"], "avatar.jpg", {
      type: "image/jpeg",
    });
    const fileInput = screen.getByTestId("file-input");

    await user.upload(fileInput, file);

    // Image input should exist
    expect(fileInput).toBeInTheDocument();
  });

  it("submits form with updated profile data", async () => {
    const user = userEvent.setup();

    // Mock successful API responses
    (api.post as any).mockResolvedValueOnce({
      data: { image: "https://example.com/avatar.jpg" },
    });
    (api.patch as any).mockResolvedValueOnce({
      data: {
        ...mockUser,
        name: "Jane Smith",
      },
    });

    mockCheckSession.mockResolvedValue(undefined);

    render(<ProfileForm />);

    // Wait for form to populate
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      expect(nameInput.value).toBe("John Doe");
    });

    const nameInput = screen.getByLabelText(/full name/i);
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    // Update name
    await user.clear(nameInput);
    await user.type(nameInput, "Jane Smith");

    // Submit form
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        "/users/me",
        expect.objectContaining({ name: "Jane Smith" })
      );
    });

    // Should refresh session after successful update
    expect(mockCheckSession).toHaveBeenCalled();
  });

  it("submits form with image upload", async () => {
    const user = userEvent.setup();

    // Mock image upload response
    (api.post as any).mockResolvedValueOnce({
      data: { image: "https://example.com/new-avatar.jpg" },
    });

    // Mock profile update response
    (api.patch as any).mockResolvedValueOnce({
      data: {
        ...mockUser,
        image: "https://example.com/new-avatar.jpg",
      },
    });

    mockCheckSession.mockResolvedValue(undefined);

    render(<ProfileForm />);

    // Wait for form to populate
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      expect(nameInput.value).toBe("John Doe");
    });

    const file = new File(["image content"], "avatar.jpg", {
      type: "image/jpeg",
    });
    const fileInput = screen.getByTestId("file-input");
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    // Upload new image
    await user.upload(fileInput, file);

    // Submit form
    await user.click(submitButton);

    await waitFor(() => {
      // Should upload image first
      expect(api.post).toHaveBeenCalledWith(
        "/users/me/upload-image",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
    });

    // Should then update profile
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/users/me", expect.any(Object));
    });

    // Should refresh session
    expect(mockCheckSession).toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    const user = userEvent.setup();

    // Mock failed API response
    (api.patch as any).mockRejectedValueOnce(new Error("Update failed"));

    render(<ProfileForm />);

    // Wait for form to populate
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      expect(nameInput.value).toBe("John Doe");
    });

    const nameInput = screen.getByLabelText(/full name/i);
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    await user.clear(nameInput);
    await user.type(nameInput, "Jane Smith");
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalled();
    });

    // Should not call checkSession on error
    expect(mockCheckSession).not.toHaveBeenCalled();
  });

  it("validates website URL format", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    // Wait for form to populate
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      expect(nameInput.value).toBe("John Doe");
    });

    const websiteInput = screen.getByLabelText(/website/i);

    // Enter invalid URL
    await user.clear(websiteInput);
    await user.type(websiteInput, "not-a-url");
    await user.tab();

    await waitFor(() => {
      const error = screen.queryByText(/invalid website url/i);
      expect(error).toBeInTheDocument();
    });
  });
});
