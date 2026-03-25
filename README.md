# GAP helper for \(p\)-regular decomposition matrices with at most 3 rows

This GAP script provides a small wrapper around the `hecke` package to extract and print the part of the decomposition matrix for the symmetric group corresponding to partitions with **at most 3 rows**, keeping only **\(p\)-regular partitions**.

So for example, when `p = 3`, the partition `[2,2,2]` is excluded.

## Requirements

- [GAP](https://www.gap-system.org/)
- the GAP package `hecke`

The script begins with:

```gap
LoadPackage("hecke");