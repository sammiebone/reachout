import sys
import json
import subprocess
import os
from pathlib import Path

def send_sms(phone_numbers, message):
    try:
        sms_sender_path = Path(__file__).parent / 'SMS-Sender'

        if not sms_sender_path.exists():
            return {
                'success': False,
                'error': 'SMS-Sender not installed. Run: git clone https://github.com/farukalpay/SMS-Sender.git'
            }

        message_ids = []
        failed = []

        for phone in phone_numbers:
            phone_clean = ''.join(filter(str.isdigit, phone))

            try:
                result = subprocess.run(
                    [sys.executable, str(sms_sender_path / 'main.py'), phone_clean, message],
                    input='US\n',
                    capture_output=True,
                    text=True,
                    timeout=15
                )

                if result.returncode == 0:
                    message_ids.append(f'sms_{phone_clean}_{len(message_ids)}')
                else:
                    failed.append({
                        'phone': phone,
                        'error': result.stderr or 'Unknown error'
                    })
            except subprocess.TimeoutExpired:
                failed.append({
                    'phone': phone,
                    'error': 'SMS service timeout'
                })
            except Exception as e:
                failed.append({
                    'phone': phone,
                    'error': str(e)
                })

        if failed and len(message_ids) == 0:
            return {
                'success': False,
                'error': f'Failed to send SMS to all numbers: {failed[0]["error"]}'
            }

        return {
            'success': True,
            'message_ids': message_ids,
            'failed': failed
        }

    except Exception as error:
        return {
            'success': False,
            'error': str(error)
        }

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    phone_numbers = data.get('phoneNumbers', [])
    message = data.get('message', '')

    result = send_sms(phone_numbers, message)
    print(json.dumps(result))
