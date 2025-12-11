import boto3
import sys

# Usage - python upload-zip.py 7.Francium_STEMS.zip
# Replace these with your actual credentials
ACCOUNT_ID = ''
ACCESS_KEY_ID = ''
SECRET_ACCESS_KEY = ''
BUCKET_NAME = ''

# Create S3 client
s3 = boto3.client('s3',
    endpoint_url=f'https://{ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=ACCESS_KEY_ID,
    aws_secret_access_key=SECRET_ACCESS_KEY,
    region_name='auto'
)

# Get file path from command line argument
if len(sys.argv) < 2:
    print("Usage: python upload_to_r2.py <file_path>")
    sys.exit(1)

local_file = sys.argv[1]
remote_file = local_file.split('/')[-1]  # Use same filename in R2

print(f"Uploading {local_file} to R2...")

# Upload file
s3.upload_file(local_file, BUCKET_NAME, remote_file)

print(f"Successfully uploaded to {BUCKET_NAME}/{remote_file}")