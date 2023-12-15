---
title: Python Dynamic Importing
createdAt: 2023-11-30
lastUpdated: 2023-11-30
draft: false
---

The need for this is fairly rare, but its a neat trick with Python: Dynamic Importing.  The only time I've used this is to "deploy" scripts to a task queue (like Celery or Dramatiq) without going through a formal deployment process.  Ensure that the script has a `run()` method, and get the file to the right place however you like, and that task can be picked up by the task queue.  Just be sure to manage the relative import paths properly, and make the target code a package.

## Sample
```python
# add_task/add.py
class TaskClass:
    @staticmethod
    def run(a: float, b: float) -> float:
        result = a + b
        return result
```

```python
# runner.py
import importlib

from typing import Any
from types import ModuleType

def run_dynamic_task(task_path: str, *args, **kwargs) -> Any:
    try:
        task_module: ModuleType = importlib.import_module(f"{task_path}", package=".")
    except ModuleNotFoundError:
        raise Exception(f"Unable to import task {task_path}")

    return task_module.TaskClass.run(*args, **kwargs)

print(run_dynamic_task("add_task.add", 1, 3))
# >>> 4
```
