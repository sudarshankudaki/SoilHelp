"""
SoilHelp - Generate Shareable QR Code
Run after publishing to create a QR code image
"""
import qrcode
import json

print("=" * 50)
print("   SoilHelp QR Code Generator")
print("=" * 50)
print()

# Try to get the username from app.json
try:
    with open('app.json', 'r') as f:
        config = json.load(f)
        slug = config['expo']['slug']
        print(f"[✓] Found app slug: {slug}")
except:
    slug = "soilhelp"
    print(f"[!] Using default slug: {slug}")

# Ask for username
username = input("\nEnter your Expo username: ").strip()

if not username:
    print("[!] No username provided. Exiting.")
    exit(1)

# Generate the Expo URL
expo_url = f"exp://exp.host/@{username}/{slug}"
print(f"\n[✓] Generated URL: {expo_url}")

# Create QR code
print("[*] Generating QR code...")
qr = qrcode.QRCode(version=1, box_size=10, border=4)
qr.add_data(expo_url)
qr.make(fit=True)

# Print ASCII QR code
print("\n" + "=" * 50)
print("   SCAN THIS QR CODE WITH EXPO GO")
print("=" * 50)
qr.print_ascii(invert=True)

# Save as image
try:
    img = qr.make_image(fill_color="black", back_color="white")
    filename = f"soilhelp-qr-code.png"
    img.save(filename)
    print(f"\n[✓] QR code saved as: {filename}")
    print(f"[i] Share this image with your teammates!")
except Exception as e:
    print(f"\n[!] Could not save image: {e}")

print("\n" + "=" * 50)
print(f"   Share this URL: {expo_url}")
print("=" * 50)
print("\nYour teammates can:")
print("  1. Scan the QR code with Expo Go app")
print(f"  2. Or open this URL directly: {expo_url}")
print()
input("Press Enter to exit...")
