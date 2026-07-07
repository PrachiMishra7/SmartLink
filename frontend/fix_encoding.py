import sys
import codecs

path = r'c:\Users\ashut\OneDrive\Desktop\SmartLink\frontend\src\App.tsx'

with open(path, 'rb') as f:
    content = f.read().decode('utf-8')

# Remove BOM if present
if content.startswith('\ufeff'):
    content = content[1:]

try:
    fixed_content = content.encode('cp1252').decode('utf-8')
    with open(path, 'wb') as f:
        f.write(fixed_content.encode('utf-8'))
    print('Fixed App.tsx successfully using cp1252 reverse encoding!')
except Exception as e:
    print('Error with full cp1252 decoding:', e)
    # manual replacements fallback
    replacements = {
        'â†’': '→',
        'â€”': '—',
        'â€“': '–',
        'â€˜': '‘',
        'â€™': '’',
        'â€œ': '“',
        'â€': '”',
        'âœ¨': '✨',
        'âš¡': '⚡',
        'Â©': '©',
        'â•': '═',
        'â€¢': '•',
        'âœ…': '✅',
        'âœ”': '✔',
        'âš ': '⚠',
        'â˜°': '☰',
        'âŒ˜': '⌘',
        'âŒƒ': '⌃',
        'â‡§': '⇧',
        'âŒ¥': '⌥',
        'â†': '←',
        'â†‘': '↑',
        'â†“': '↓'
    }
    for bad, good in replacements.items():
        content = content.replace(bad, good)
    with open(path, 'wb') as f:
        f.write(content.encode('utf-8'))
    print('Fixed App.tsx using fallback replacements!')
