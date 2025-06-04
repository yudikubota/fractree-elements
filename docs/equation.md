# Mathematical Equations for the Figure Generation

This document outlines the core mathematical equations used in the generation of the Fractree logo figure, based on the provided geometric definitions.

## Parameters

The geometry is primarily defined by three positive design parameters:
*   $r$: Radius of the inner base circle.
*   $d$: An offset distance used to define the mid and outer circles.
*   $h$: An offset distance used to define the auxiliary circles for masking.

## Foundational Circle Equations

The figure's geometry is based on six foundational circles, each defined by an implicit equation $f_k(x,y)=0$. A point $(x,y)$ is inside or on the k-th circle if $f_k(x,y) \le 0$.

1.  **Inner Circle ($C_1$)**:
    $$f_1(x,y) = x^2 + y^2 - r^2$$
2.  **Top Mid-Circle ($C_2$)**:
    $$f_2(x,y) = x^2 + (y-d)^2 - (r+d)^2$$
3.  **Bottom Mid-Circle ($C_3$)**:
    $$f_3(x,y) = x^2 + (y+d)^2 - (r+d)^2$$
4.  **Outer Circle ($C_4$)**:
    $$f_4(x,y) = x^2 + y^2 - (r+2d)^2$$
5.  **Upper Auxiliary Circle ($C_5$)** (for masking):
    $$f_5(x,y) = x^2 + (y-h)^2 - (2h)^2$$
6.  **Lower Auxiliary Circle ($C_6$)** (for masking):
    $$f_6(x,y) = x^2 + (y+h)^2 - (2h)^2$$

## Combined Outline Equation

A single implicit equation representing the **outline of the union of all six foundational circles** is given by the product of their individual functions:

$$ F(x,y) = \prod_{k=1}^{6} f_k(x,y) = f_1 \cdot f_2 \cdot f_3 \cdot f_4 \cdot f_5 \cdot f_6 = 0 $$

A point $(x,y)$ lies on the boundary of at least one of these six circles if $F(x,y)=0$.

## Equation for the Primary Visual Region (PVR)

The actual visual figure often consists of elements (like radial spokes) drawn within a specific region, primarily constrained by an annular area and a lens-shaped mask derived from the auxiliary circles $C_5$ and $C_6$.

This Primary Visual Region (PVR) can be described as the set of points $(x,y)$ satisfying the following conditions:
1.  Outside or on the Inner Circle ($C_1$): $f_1(x,y) \ge 0$
2.  Inside or on the Outer Circle ($C_4$): $f_4(x,y) \le 0$
3.  Inside or on the Upper Auxiliary Circle ($C_5$): $f_5(x,y) \le 0$
4.  Inside or on the Lower Auxiliary Circle ($C_6$): $f_6(x,y) \le 0$

These conditions define an annulus (between $C_1$ and $C_4$) intersected with the lens shape formed by the intersection of $C_5$ and $C_6$.

A single inequality describing this PVR is:
$$ G_{PVR}(x,y) = \max(-f_1(x,y), f_4(x,y), f_5(x,y), f_6(x,y)) \le 0 $$

Points $(x,y)$ for which $G_{PVR}(x,y) \le 0$ fall within this primary region where the main graphical elements are typically rendered.

**Note:** The radial spokes themselves can be configured with specific inner ($R_{in}$) and outer ($R_{out}$) radii. If these differ from $r$ (radius of $C_1$) and $r+2d$ (radius of $C_4$), the terms $-f_1(x,y)$ and $f_4(x,y)$ in the $G_{PVR}$ equation would be replaced by $-(x^2+y^2-R_{in}^2)$ and $(x^2+y^2-R_{out}^2)$ respectively. The form using $f_1$ and $f_4$ represents a common default configuration where spokes span the region from the inner circle to the outer circle. 

## Radial Spoke Equations

The figure incorporates a series of radial lines (spokes), each with a defined position, length, and thickness. These are typically rendered within the PVR or other masked regions.

**Spoke Parameters:**
*   $N_{spokes}$: Total number of spokes.
*   $R_{in}$: Inner radius from which spokes emanate.
*   $R_{out}$: Outer radius to which spokes extend.
*   $\theta_{off}$: Initial angular offset for the first spoke (typically 0).
*   $T_{min}$: Minimum thickness of a spoke.
*   $T_{max}$: Maximum thickness of a spoke.
*   $\theta_{peak}$: Angle at which spoke thickness is maximal (or minimal, if inverted).
*   $isInverted$: Boolean flag; if true, thickness increases with angular distance from $\theta_{peak}$, otherwise it decreases.

**1. Spoke Angles:**
The angles $\theta_k$ for each of the $N_{spokes}$ spokes (where $k = 0, 1, \dots, N_{spokes}-1$) are given by:
$$ \theta_k = \theta_{off} + k \cdot \frac{2\pi}{N_{spokes}} $$

**2. Spoke Geometry (Centerline):**
Each spoke $S_k$ is a line segment. A point $(x,y)$ is on the centerline of spoke $S_k$ if:
$$ x = \rho \cos(\theta_k) $$
$$ y = \rho \sin(\theta_k) $$
where $R_{in} \le \rho \le R_{out}$.

**3. Spoke Thickness Function:**
The thickness $W(\theta_k)$ of the spoke $S_k$ at angle $\theta_k$ is calculated as follows:
Let the normalized angular distance from the peak angle be $\phi_k = \frac{(\theta_k - \theta_{peak}) \pmod{2\pi}}{2\pi}$.
Then the thickness function $G_W$ is:
$$ G_W(\phi_k, isInverted) = \begin{cases} \phi_k & \text{if } isInverted \\ (1-\phi_k) & \text{if not } isInverted \end{cases} $$
And the spoke width is:
$$ W(\theta_k) = T_{min} + (T_{max} - T_{min}) \cdot G_W(\phi_k, isInverted) $$

**4. Implicit Condition for a Point in Spoke $S_k$:**
A point $(x,y)$ is considered part of the rendered area of spoke $S_k$ (with angle $\theta_k$ and width $W(\theta_k)$) if it satisfies the following conditions simultaneously:
*   It lies within the radial bounds: $R_{in}^2 \le x^2+y^2 \le R_{out}^2$.
*   Its perpendicular distance squared to the spoke's centerline is less than or equal to $(W(\theta_k)/2)^2$. The centerline passes through the origin at angle $\theta_k$. The equation of the line is $x \sin\theta_k - y \cos\theta_k = 0$. The squared distance is $(x \sin\theta_k - y \cos\theta_k)^2$.

Let $S_k^{cond}(x,y)$ be a function such that $S_k^{cond}(x,y) \le 0$ if the point $(x,y)$ is in spoke $S_k$:
$$ S_k^{cond}(x,y) = \max \left( (x \sin\theta_k - y \cos\theta_k)^2 - \left(\frac{W(\theta_k)}{2}\right)^2, \quad (x^2+y^2) - R_{out}^2, \quad R_{in}^2 - (x^2+y^2) \right) $$
Note that $W(\theta_k)$ itself depends on $k$ via $\theta_k$.

Visually, each spoke $S_k$ is rendered as its centerline expanded to the width $W(\theta_k)$, and then clipped by the PVR and any other active masks.

## Unified Equation for Visible Spokes

The visible portion of the spokes consists of all points $(x,y)$ that belong to at least one spoke $S_k$ AND fall within the Primary Visual Region (PVR).

1.  **Condition for a point $(x,y)$ to be in the union of all spokes:**
    Let $S_{all}^{cond}(x,y) = \min_{k \in \{0, ..., N_{spokes}-1\}} S_k^{cond}(x,y)$.
    A point $(x,y)$ is in at least one spoke if $S_{all}^{cond}(x,y) \le 0$.

2.  **Condition for a point $(x,y)$ to be in the PVR:**
    As defined earlier, $G_{PVR}(x,y) \le 0$.

Combining these, a point $(x,y)$ is part of the visible spokes if:
$$ \max(S_{all}^{cond}(x,y), G_{PVR}(x,y)) \le 0 $$
This single inequality, $K(x,y) = \max \left( \left( \min_{k} S_k^{cond}(x,y) \right), G_{PVR}(x,y) \right) \le 0$, defines the complete set of points for all visible spokes, respecting the PVR mask.

## Summarized Equations

**Parameters (Circles):** $r, d, h > 0$

**Foundational Circles:**
$f_1(x,y) = x^2 + y^2 - r^2$
$f_2(x,y) = x^2 + (y-d)^2 - (r+d)^2$
$f_3(x,y) = x^2 + (y+d)^2 - (r+d)^2$
$f_4(x,y) = x^2 + y^2 - (r+2d)^2$
$f_5(x,y) = x^2 + (y-h)^2 - (2h)^2$
$f_6(x,y) = x^2 + (y+h)^2 - (2h)^2$

**Combined Outline:**
$$ F(x,y) = \prod_{k=1}^{6} f_k(x,y) = 0 $$

**Primary Visual Region (PVR):**
$$ G_{PVR}(x,y) = \max(-f_1(x,y), f_4(x,y), f_5(x,y), f_6(x,y)) \le 0 $$

**Parameters (Spokes):**
$N_{spokes}, R_{in}, R_{out}, \theta_{off}, T_{min}, T_{max}, \theta_{peak}, isInverted$

**Spoke Angles ($\theta_k$ for $k=0, \dots, N_{spokes}-1$):**
$$ \theta_k = \theta_{off} + k \frac{2\pi}{N_{spokes}} $$

**Spoke Centerline ($S_k$):** For $R_{in} \le \rho \le R_{out}$
$x = \rho \cos(\theta_k)$, $y = \rho \sin(\theta_k)$

**Spoke Thickness ($W(\theta_k)$):**
Let $\phi_k = \frac{(\theta_k - \theta_{peak}) \pmod{2\pi}}{2\pi}$.
$G_W = isInverted ? \phi_k : (1-\phi_k)$.
$$ W(\theta_k) = T_{min} + (T_{max} - T_{min}) \cdot G_W $$

**Condition for Point $(x,y)$ in Spoke $S_k$ ($S_k^{cond}(x,y) \le 0$):**
$$ S_k^{cond}(x,y) = \max \left( (x \sin\theta_k - y \cos\theta_k)^2 - \left(\frac{W(\theta_k)}{2}\right)^2, (x^2+y^2) - R_{out}^2, R_{in}^2 - (x^2+y^2) \right) $$

**Unified Equation for Visible Spokes ($K(x,y) \le 0$):**
Let $S_{all}^{cond}(x,y) = \min_{k \in \{0, ..., N_{spokes}-1\}} S_k^{cond}(x,y)$.
$$ K(x,y) = \max(S_{all}^{cond}(x,y), G_{PVR}(x,y)) $$
A point $(x,y)$ is part of the visible spokes if $K(x,y) \le 0$. 