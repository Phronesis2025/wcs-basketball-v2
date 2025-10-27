# Modal Template Component

A comprehensive, reusable modal template component that includes forms, dropdowns, image uploads, and date selectors. This template is based on the existing `AddCoachModal` component and can be customized for various use cases.

## Features

- ✅ **Form Fields**: Text inputs, textareas, email, phone, and date inputs
- ✅ **Dropdowns**: Role, department, and status selectors with customizable options
- ✅ **File Uploads**: Image upload with preview and document upload
- ✅ **Date Selectors**: Start date, end date, and birth date inputs
- ✅ **Form Validation**: Client-side validation with error handling
- ✅ **Responsive Design**: Mobile-first design with responsive layouts
- ✅ **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- ✅ **Loading States**: Upload and save state management
- ✅ **Delete Functionality**: Optional delete confirmation modal
- ✅ **Scroll Lock**: Prevents background scrolling when modal is open

## Usage

### Basic Implementation

```tsx
import ModalTemplate from "@/components/ui/ModalTemplate";

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleSubmit = (data) => {
    console.log("Form data:", data);
    // Handle form submission
    setIsModalOpen(false);
  };

  const handleDelete = (data) => {
    console.log("Delete data:", data);
    // Handle deletion
    setIsModalOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>

      <ModalTemplate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        editingData={editingData}
        title="Coach"
        deleteTitle="Delete Coach"
        deleteMessage="Are you sure you want to delete this coach?"
      />
    </div>
  );
}
```

### Customizing the Template

#### 1. Modify the ModalData Interface

Update the `ModalData` interface to match your specific needs:

```tsx
interface ModalData {
  // Add your custom fields
  customField: string;
  anotherField: number;
  // ... other fields
}
```

#### 2. Customize Dropdown Options

Modify the dropdown options arrays:

```tsx
const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  // Add your custom options
];

const departmentOptions = [
  { value: "soccer", label: "Soccer" },
  { value: "basketball", label: "Basketball" },
  // Add your custom options
];
```

#### 3. Update Form Validation

Modify the `validateForm` function to include your custom validation rules:

```tsx
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  // Add your custom validation rules
  if (!formData.customField.trim()) {
    newErrors.customField = "Custom field is required";
  }

  // ... rest of validation
  return Object.keys(newErrors).length === 0;
};
```

#### 4. Customize File Upload Logic

Replace the mock upload functions with your actual upload implementation:

```tsx
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const result = await response.json();
  return result.url;
};
```

## Props Interface

```tsx
interface ModalTemplateProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Called when modal should close
  onSubmit: (data: ModalData) => void; // Called when form is submitted
  onDelete?: (data: ModalData) => void; // Optional delete handler
  editingData?: ModalData | null; // Data for editing mode
  loading?: boolean; // Loading state
  title: string; // Modal title
  deleteTitle?: string; // Delete confirmation title
  deleteMessage?: string; // Delete confirmation message
}
```

## Form Fields Included

### Text Fields

- First Name (required)
- Last Name (required)
- Email (required, with validation)
- Phone (optional, with validation)
- Bio (textarea)
- Description (textarea)

### Dropdowns

- Role (required)
- Department (optional)
- Status (active/inactive/pending/suspended)

### Date Fields

- Start Date
- End Date (with validation against start date)
- Birth Date

### File Uploads

- Profile Image (with preview)
- Document Upload (PDF, DOC, DOCX)

### Checkboxes

- Active Status
- Public Visibility

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- **Colors**: Blue primary, red for errors, gray for neutral elements
- **Typography**: Uses `font-bebas` for headings, standard fonts for content
- **Spacing**: Consistent padding and margins using Tailwind spacing scale
- **Responsive**: Mobile-first design with responsive breakpoints

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Automatic focus on first error field
- **Screen Reader Support**: Descriptive text and error messages
- **High Contrast**: Error states clearly visible

## Error Handling

The component includes comprehensive error handling:

- **Field Validation**: Required field validation
- **Format Validation**: Email and phone format validation
- **File Validation**: File type and size validation
- **Date Validation**: Date range validation
- **Upload Errors**: File upload error handling
- **General Errors**: General error display

## Dependencies

The component requires these dependencies:

```tsx
import { useScrollLock } from "@/hooks/useScrollLock";
```

Make sure the `useScrollLock` hook is available in your project.

## Customization Examples

### Example 1: Player Modal

```tsx
// Customize for player management
const playerRoleOptions = [
  { value: "goalkeeper", label: "Goalkeeper" },
  { value: "defender", label: "Defender" },
  { value: "midfielder", label: "Midfielder" },
  { value: "forward", label: "Forward" },
];

// Add player-specific fields
interface PlayerData extends ModalData {
  jerseyNumber: number;
  position: string;
  teamId: string;
}
```

### Example 2: Event Modal

```tsx
// Customize for event management
const eventTypeOptions = [
  { value: "game", label: "Game" },
  { value: "practice", label: "Practice" },
  { value: "meeting", label: "Meeting" },
];

// Add event-specific fields
interface EventData extends ModalData {
  eventType: string;
  location: string;
  duration: number;
}
```

## Best Practices

1. **Always validate on the server**: Client-side validation is for UX, server-side validation is for security
2. **Handle loading states**: Show appropriate loading indicators during async operations
3. **Provide clear error messages**: Make error messages specific and actionable
4. **Test accessibility**: Ensure the modal works with screen readers and keyboard navigation
5. **Optimize images**: Compress images before upload to improve performance
6. **Use TypeScript**: Leverage TypeScript for better type safety and developer experience

## Troubleshooting

### Common Issues

1. **Modal not opening**: Check that `isOpen` prop is properly managed
2. **Form not submitting**: Verify that `onSubmit` handler is provided
3. **File upload failing**: Check file size limits and supported formats
4. **Validation errors**: Ensure all required fields are properly validated
5. **Styling issues**: Verify Tailwind CSS is properly configured

### Debug Tips

- Use browser dev tools to inspect form data
- Check console for validation errors
- Verify file upload endpoints are working
- Test with different screen sizes for responsive issues

## Contributing

When modifying this template:

1. Maintain backward compatibility
2. Add proper TypeScript types
3. Include accessibility features
4. Test on multiple devices and browsers
5. Update documentation for new features

## License

This component follows the same license as the parent project.
