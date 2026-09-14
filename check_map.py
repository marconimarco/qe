import re

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

target = "{[result.vitali, result.metabolici, result.organo, result.infiammatorio].map((cat, idx) => ("

if target in content:
    print("Map target found!")
else:
    print("Map target NOT found.")
