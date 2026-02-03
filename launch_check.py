import os
import time

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def countdown():
    steps = [
        "1. Backend live on Railway (Check URLs)",
        "2. Frontend live on Vercel (Check UI)",
        "3. Stripe keys added to .env (Check Billing)",
        "4. OpenAI key active (Check AI Fixes)",
        "5. Social posts shared (Check Hype)",
        "6. Product Hunt live (Check Global Launch)"
    ]
    
    print("\n🚀 BUGHUNTER AI - LAUNCH CHECKLIST\n")
    print("==================================\n")
    
    for i, step in enumerate(steps):
        print(f"{step}")
        time.sleep(0.5)
        
    print("\n🎯 Goal: First $1,000 MRR is within reach!")
    print("\nRun this any time you need focus. Let's go! 🔥")

if __name__ == "__main__":
    countdown()
