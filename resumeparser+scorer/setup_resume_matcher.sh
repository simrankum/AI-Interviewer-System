#!/bin/zsh

mkdir -p resume_matcher/app
mkdir -p resume_matcher/models
mkdir -p resume_matcher/outputs

touch resume_matcher/app/__init__.py
touch resume_matcher/app/matcher.py
touch resume_matcher/app/feedback_generator.py
touch resume_matcher/app/parser.py
touch resume_matcher/app/utils.py

touch resume_matcher/models/skills.json

touch resume_matcher/config.py
touch resume_matcher/requirements.txt
touch resume_matcher/main.py

echo "✅ Project structure created successfully!"


