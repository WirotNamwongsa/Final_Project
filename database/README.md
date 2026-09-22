# Database Setup Instructions

## Supabase Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Choose a database password and region
4. Wait for the project to be created

### 2. Run the Schema
1. Open the Supabase SQL Editor
2. Copy the contents of `schema.sql`
3. Paste and run the SQL script
4. Verify all tables are created successfully

### 3. Configure Environment Variables
Update your backend `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Set Up Authentication
1. Go to Authentication > Settings in Supabase
2. Configure your site URL and redirect URLs
3. Enable email/password authentication if needed

### 5. Configure Storage (Optional)
If you want to store files in Supabase Storage instead of local storage:

1. Create a storage bucket named `uploads`
2. Set up appropriate RLS policies
3. Update the upload controllers to use Supabase Storage

### 6. Test Database Connection
Run your backend server and test the database connection:

```bash
cd backend
npm start
```

### 7. Verify Tables
The following tables should be created:
- `users` - User authentication
- `departments` - Academic departments
- `courses` - Course information
- `students` - Student records
- `student_images` - Uploaded images
- `orders` - Student orders
- `payments` - Payment records
- `inventory_items` - Available items
- `order_items` - Order line items
- `system_settings` - Configuration
- `audit_logs` - Activity tracking

### 8. Default Data
The schema includes:
- 1 admin user (username: `admin`, password: `admin123`)
- Sample  and courses
- Sample inventory items
- System settings

### 9. Security Features
- Row Level Security (RLS) enabled
- Thai ID number validation
- Audit logging
- Input validation and sanitization

### 10. Backup Strategy
- Enable daily backups in Supabase
- Export schema regularly
- Test restore procedures

## Database Schema Overview

### Core Tables
- **students**: Main student information
- **departments**: Academic departments
- **courses**: Available courses
- **users**: System users (admin/student)

### Supporting Tables
- **student_images**: File uploads
- **orders**: Student orders
- **payments**: Payment records
- **inventory_items**: Available products

### System Tables
- **system_settings**: Configuration
- **audit_logs**: Activity tracking

### Views
- **student_statistics**: Student summary data
- **payment_statistics**: Payment summary data
- **order_statistics**: Order summary data
