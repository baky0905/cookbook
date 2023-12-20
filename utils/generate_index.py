import os


def generate_index():
    folder_name = os.path.basename(os.path.abspath("docs"))
    files = []

    # Recursively gather all .md files in the docs directory
    for root, dirs, filenames in os.walk("docs"):
        for filename in filenames:
            if filename.endswith(".md") and filename != "index.md":
                files.append(os.path.relpath(os.path.join(root, filename), "docs"))

    files.sort()

    with open("docs/index.md", "w") as index_file:
        index_file.write(f"# Welcome to {folder_name.capitalize()} Documentation\n\n")
        index_file.write("Check out the following pages:\n\n")
        for file in files:
            page_name = os.path.splitext(file)[0]
            index_file.write(f"- [{page_name.capitalize()}]({file})\n")

if __name__ == "__main__":
    generate_index()
